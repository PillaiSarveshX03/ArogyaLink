import { supabase } from '../config/supabase.js';

class NotificationLogService {
  constructor() {
    // In-memory occurrence map for fast idempotency checks
    // Key: `${patientId}:${courseId}:${scheduledDate}:${scheduledTime}`
    this.memoryLog = new Map();
  }

  /**
   * Generate an idempotent occurrence key
   */
  generateKey(patientId, courseId, scheduledDate, scheduledTime) {
    return `${patientId}:${courseId}:${scheduledDate}:${scheduledTime.trim().toUpperCase()}`;
  }

  /**
   * Check if a reminder occurrence was already successfully sent
   */
  async hasBeenSent(occurrenceKey) {
    // 1. Fast in-memory check
    const record = this.memoryLog.get(occurrenceKey);
    if (record && record.status === 'sent') {
      return true;
    }

    // 2. Persistent check in Supabase activity_logs if available
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('id, description, status')
          .eq('type', 'medication_reminder')
          .ilike('description', `%${occurrenceKey}%`)
          .eq('status', 'success')
          .limit(1);

        if (!error && data && data.length > 0) {
          this.memoryLog.set(occurrenceKey, { status: 'sent', sentAt: new Date().toISOString() });
          return true;
        }
      } catch (err) {
        console.warn('⚠️ [NotificationLogService] Supabase check error:', err.message);
      }
    }

    return false;
  }

  /**
   * Get occurrence record (to inspect retries or status)
   */
  getOccurrence(occurrenceKey) {
    return this.memoryLog.get(occurrenceKey) || null;
  }

  /**
   * Record a successfully sent email reminder
   */
  async recordSent({
    occurrenceKey,
    patientId,
    courseId,
    medicineName,
    dosage,
    scheduledTime,
    scheduledDate,
    recipientEmail,
    messageId,
  }) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      occurrenceKey,
      patientId,
      courseId,
      medicineName,
      dosage,
      scheduledTime,
      scheduledDate,
      recipientEmail,
      channel: 'email',
      status: 'sent',
      messageId,
      retryCount: 0,
      sentAt: timestamp,
    };

    // Store in memory
    this.memoryLog.set(occurrenceKey, logEntry);

    // Persist to Supabase activity_logs
    if (supabase && patientId && !patientId.startsWith('user-')) {
      try {
        await supabase.from('activity_logs').insert({
          patient_id: patientId,
          type: 'medication_reminder',
          title: `Medication Reminder: ${medicineName} (${scheduledTime})`,
          description: `Automated reminder email sent to ${recipientEmail} [${occurrenceKey}]`,
          status: 'success',
        });
      } catch (dbErr) {
        console.warn('⚠️ [NotificationLogService] Could not persist to activity_logs:', dbErr.message);
      }
    }

    console.log(`📝 [NotificationLogService] Recorded SUCCESS for ${occurrenceKey}`);
    return logEntry;
  }

  /**
   * Record a failed email reminder attempt
   */
  async recordFailure({
    occurrenceKey,
    patientId,
    courseId,
    medicineName,
    dosage,
    scheduledTime,
    scheduledDate,
    recipientEmail,
    error,
  }) {
    const existing = this.memoryLog.get(occurrenceKey);
    const retryCount = (existing?.retryCount || 0) + 1;
    const timestamp = new Date().toISOString();

    const logEntry = {
      occurrenceKey,
      patientId,
      courseId,
      medicineName,
      dosage,
      scheduledTime,
      scheduledDate,
      recipientEmail,
      channel: 'email',
      status: 'failed',
      error,
      retryCount,
      failedAt: timestamp,
    };

    this.memoryLog.set(occurrenceKey, logEntry);

    if (supabase && patientId && !patientId.startsWith('user-')) {
      try {
        await supabase.from('activity_logs').insert({
          patient_id: patientId,
          type: 'medication_reminder',
          title: `Failed Reminder: ${medicineName} (${scheduledTime})`,
          description: `Email delivery to ${recipientEmail} failed: ${error} [${occurrenceKey}] (Attempt ${retryCount})`,
          status: 'warning',
        });
      } catch (dbErr) {
        console.warn('⚠️ [NotificationLogService] Could not log failure to activity_logs:', dbErr.message);
      }
    }

    console.warn(`⚠️ [NotificationLogService] Recorded FAILURE for ${occurrenceKey} (Attempt ${retryCount}): ${error}`);
    return logEntry;
  }

  /**
   * Get all memory logs (for testing or dashboard)
   */
  getAllLogs() {
    return Array.from(this.memoryLog.values());
  }

  /**
   * Clear logs (for test isolation)
   */
  clear() {
    this.memoryLog.clear();
  }
}

export const notificationLogService = new NotificationLogService();
export default notificationLogService;
