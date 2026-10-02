import { Router } from 'express';
import { reminderScheduler } from '../services/reminder-scheduler.js';
import { notificationLogService } from '../services/notification-log-service.js';
import { emailService } from '../services/email-service.js';

const router = Router();

/**
 * 1. Get reminder scheduler status
 */
router.get('/status', (req, res) => {
  const localTime = reminderScheduler.getUserLocalTime();
  const localDate = reminderScheduler.getUserLocalDate();

  res.json({
    status: 'active',
    schedulerRunning: reminderScheduler.isRunning,
    systemTime: new Date().toISOString(),
    localTime,
    localDate,
    defaultTimeZone: reminderScheduler.defaultTimeZone,
    emailProvider: emailService.providerType,
  });
});

/**
 * 2. Get notification audit logs
 */
router.get('/logs', (req, res) => {
  const logs = notificationLogService.getAllLogs();
  res.json({
    count: logs.length,
    logs,
  });
});

/**
 * 3. Manually trigger a scheduler cycle (for deterministic verification and testing)
 */
router.post('/trigger', async (req, res) => {
  try {
    const { targetTime, targetDate, forceAllTimes, patientId } = req.body;

    const result = await reminderScheduler.checkAndDispatchReminders({
      targetTime,
      targetDate,
      forceAllTimes: forceAllTimes ?? true,
      patientIdFilter: patientId,
    });

    res.json({
      success: true,
      result,
    });
  } catch (err) {
    console.error('❌ [Reminders Route] Error triggering reminders:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4. Send a verified test reminder email to a patient's signup email
 */
router.post('/test-email', async (req, res) => {
  try {
    const { email, userName, medicineName, dosage, scheduledTime, mealRelation, instructions } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    const result = await emailService.sendMedicationReminder({
      to: email,
      userName: userName || 'Patient',
      medicineName: medicineName || 'Metformin 500mg',
      dosage: dosage || '500mg',
      scheduledTime: scheduledTime || '08:00 AM',
      mealRelation: mealRelation || 'after_meal',
      instructions: instructions || 'Take with water after breakfast',
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
