import { patientService } from './patient-service.js';
import { emailService } from './email-service.js';
import { notificationLogService } from './notification-log-service.js';

export class ReminderScheduler {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.isProcessing = false;
    this.defaultTimeZone = 'Asia/Kolkata';
  }

  /**
   * Start the background scheduler
   */
  start(intervalMs = 60000) {
    if (this.isRunning) {
      console.log('⏰ [ReminderScheduler] Scheduler is already active.');
      return;
    }

    this.isRunning = true;
    console.log(`⏰ [ReminderScheduler] Starting background medicine reminder scheduler (Interval: ${intervalMs / 1000}s)`);

    // Run first check after a brief server startup grace period (5 seconds)
    setTimeout(() => {
      this.checkAndDispatchReminders().catch(err => {
        console.error('❌ [ReminderScheduler] Error during initial tick:', err);
      });
    }, 5000);

    // Schedule regular ticks
    this.intervalId = setInterval(() => {
      this.checkAndDispatchReminders().catch(err => {
        console.error('❌ [ReminderScheduler] Error during scheduled tick:', err);
      });
    }, intervalMs);
  }

  /**
   * Stop the background scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏰ [ReminderScheduler] Scheduler stopped.');
  }

  /**
   * Normalize time string into "HH:MM AM/PM" format
   */
  normalizeTime(timeStr) {
    if (!timeStr) return '';
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (!match) return timeStr.trim().toUpperCase();

    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const meridiem = match[3] ? match[3].toUpperCase() : null;

    if (meridiem) {
      return `${String(hour).padStart(2, '0')}:${minute} ${meridiem}`;
    }

    const period = hour >= 12 ? 'PM' : 'AM';
    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;

    return `${String(hour).padStart(2, '0')}:${minute} ${period}`;
  }

  /**
   * Calculate local time for user in their timezone
   */
  getUserLocalTime(timeZone = this.defaultTimeZone) {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(new Date());
    } catch {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: this.defaultTimeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(new Date());
    }
  }

  /**
   * Calculate local date YYYY-MM-DD for user in their timezone
   */
  getUserLocalDate(timeZone = this.defaultTimeZone) {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(new Date());

      const year = parts.find(p => p.type === 'year')?.value;
      const month = parts.find(p => p.type === 'month')?.value;
      const day = parts.find(p => p.type === 'day')?.value;
      return `${year}-${month}-${day}`;
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Main check & dispatch routine
   */
  async checkAndDispatchReminders({
    targetTime = null,
    targetDate = null,
    forceAllTimes = false,
    patientIdFilter = null,
  } = {}) {
    if (this.isProcessing) {
      console.log('⏳ [ReminderScheduler] Previous execution tick still in progress. Skipping to prevent overlap.');
      return { skipped: true, reason: 'in_progress' };
    }

    this.isProcessing = true;
    const summary = {
      timestamp: new Date().toISOString(),
      checkedCourses: 0,
      remindersSent: 0,
      remindersSkipped: 0,
      remindersFailed: 0,
      details: [],
    };

    try {
      // 1. Fetch all active courses from verified database
      const courses = await patientService.getAllActiveCourses();
      summary.checkedCourses = courses.length;

      for (const course of courses) {
        // Filter by patient ID if specified
        if (patientIdFilter && course.patient_id !== patientIdFilter) {
          continue;
        }

        // Safety 1: Course must be active
        if (course.status !== 'active') {
          summary.remindersSkipped++;
          summary.details.push({
            courseId: course.id,
            medicine: course.medicine_name,
            reason: `Course status is '${course.status}', not active`,
          });
          continue;
        }

        // Safety 2: Resolve user signup email from authenticated profile
        const recipientEmail = course.patient?.email;
        if (!recipientEmail) {
          summary.remindersSkipped++;
          summary.details.push({
            courseId: course.id,
            medicine: course.medicine_name,
            reason: 'User profile does not contain a registered email address',
          });
          continue;
        }

        // Safety 3: Respect user timezone
        const userTimeZone = course.patient?.timezone || this.defaultTimeZone;
        const currentLocalTime = targetTime || this.getUserLocalTime(userTimeZone);
        const currentLocalDate = targetDate || this.getUserLocalDate(userTimeZone);
        const normalizedCurrentTime = this.normalizeTime(currentLocalTime);

        // Safety 4: Medication lifecycle dates
        if (course.start_date && currentLocalDate < course.start_date) {
          summary.remindersSkipped++;
          summary.details.push({
            courseId: course.id,
            medicine: course.medicine_name,
            reason: `Schedule has not started yet (Start: ${course.start_date}, Today: ${currentLocalDate})`,
          });
          continue;
        }

        if (course.end_date && currentLocalDate > course.end_date) {
          summary.remindersSkipped++;
          summary.details.push({
            courseId: course.id,
            medicine: course.medicine_name,
            reason: `Medication schedule ended on ${course.end_date}`,
          });
          continue;
        }

        // Safety 5: Deterministic schedule matching
        const scheduledTimes = Array.isArray(course.times_of_day) ? course.times_of_day : ['08:00 AM'];

        for (const rawTime of scheduledTimes) {
          const scheduledTime = this.normalizeTime(rawTime);

          // If not forcing all times for test, check exact time match
          if (!forceAllTimes && scheduledTime !== normalizedCurrentTime) {
            continue;
          }

          // Safety 6: Duplicate prevention / Idempotency
          const occurrenceKey = notificationLogService.generateKey(
            course.patient_id,
            course.id,
            currentLocalDate,
            scheduledTime
          );

          const alreadySent = await notificationLogService.hasBeenSent(occurrenceKey);
          if (alreadySent) {
            summary.remindersSkipped++;
            summary.details.push({
              occurrenceKey,
              medicine: course.medicine_name,
              scheduledTime,
              reason: 'Reminder already successfully sent for this occurrence',
            });
            continue;
          }

          // Safety 7: Check retry cap to avoid infinite loops
          const existing = notificationLogService.getOccurrence(occurrenceKey);
          if (existing && existing.retryCount >= 3) {
            summary.remindersSkipped++;
            summary.details.push({
              occurrenceKey,
              medicine: course.medicine_name,
              scheduledTime,
              reason: 'Max retries (3) reached for this occurrence',
            });
            continue;
          }

          // 7. Dispatch medication reminder email
          const patientName = `${course.patient?.first_name || 'Patient'} ${course.patient?.last_name || ''}`.trim();
          
          console.log(`🚀 [ReminderScheduler] Dispatching reminder for ${course.medicine_name} to ${recipientEmail} (${scheduledTime})`);

          const emailResult = await emailService.sendMedicationReminder({
            to: recipientEmail,
            userName: patientName,
            medicineName: course.medicine_name,
            dosage: course.dosage,
            scheduledTime,
            mealRelation: course.meal_relation,
            instructions: course.instructions,
            notes: course.notes,
          });

          if (emailResult.success) {
            summary.remindersSent++;
            await notificationLogService.recordSent({
              occurrenceKey,
              patientId: course.patient_id,
              courseId: course.id,
              medicineName: course.medicine_name,
              dosage: course.dosage,
              scheduledTime,
              scheduledDate: currentLocalDate,
              recipientEmail,
              messageId: emailResult.messageId,
            });

            summary.details.push({
              occurrenceKey,
              medicine: course.medicine_name,
              dosage: course.dosage,
              recipient: recipientEmail,
              scheduledTime,
              status: 'sent',
              messageId: emailResult.messageId,
              previewUrl: emailResult.previewUrl,
            });
          } else {
            summary.remindersFailed++;
            await notificationLogService.recordFailure({
              occurrenceKey,
              patientId: course.patient_id,
              courseId: course.id,
              medicineName: course.medicine_name,
              dosage: course.dosage,
              scheduledTime,
              scheduledDate: currentLocalDate,
              recipientEmail,
              error: emailResult.error,
            });

            summary.details.push({
              occurrenceKey,
              medicine: course.medicine_name,
              recipient: recipientEmail,
              scheduledTime,
              status: 'failed',
              error: emailResult.error,
            });
          }
        }
      }
    } catch (tickErr) {
      console.error('❌ [ReminderScheduler] Unexpected error during reminder dispatch:', tickErr);
    } finally {
      this.isProcessing = false;
    }

    return summary;
  }
}

export const reminderScheduler = new ReminderScheduler();
export default reminderScheduler;
