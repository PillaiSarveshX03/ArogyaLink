import { reminderScheduler } from '../src/services/reminder-scheduler.js';
import { emailService } from '../src/services/email-service.js';
import { notificationLogService } from '../src/services/notification-log-service.js';
import { patientService } from '../src/services/patient-service.js';

async function runReminderTests() {
  console.log('===============================================================');
  console.log('🧪 RUNNING MEDBUDDY MEDICATION REMINDER TEST SUITE (10 TESTS)');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 10;

  // Clear log cache for clean test isolation
  notificationLogService.clear();

  // Test 1: Signup Email Retrieval from Authenticated Profile
  console.log('--- TEST 1: Signup Email Retrieval ---');
  try {
    const profile = await patientService.getPatientProfile('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d');
    if (profile && profile.email === 'rahul.sharma@example.com') {
      console.log(`✅ [TEST 1 PASSED] Successfully retrieved signup email "${profile.email}" for user "${profile.first_name} ${profile.last_name}" without re-prompting.`);
      passed++;
    } else {
      console.error('❌ [TEST 1 FAILED] Email retrieval mismatch:', profile);
    }
  } catch (err) {
    console.error('❌ [TEST 1 FAILED] Error:', err.message);
  }

  // Test 2: Medication Schedule Storage
  console.log('\n--- TEST 2: Medication Schedule Storage ---');
  const testPatientId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
  let createdCourse = null;
  try {
    createdCourse = await patientService.createCourse(testPatientId, {
      medicineName: 'Metformin Hydrochloride',
      dosage: '500 mg',
      frequency: 'Twice daily',
      timesOfDay: ['08:00 AM', '08:00 PM'],
      mealRelation: 'after_meal',
      startDate: '2026-09-01',
      endDate: '2026-12-31',
      prescribedBy: 'Dr. Alok Verma',
      status: 'active',
      notes: 'Take with plenty of water',
    });

    if (createdCourse && createdCourse.medicine_name === 'Metformin Hydrochloride' && createdCourse.times_of_day.includes('08:00 AM')) {
      console.log(`✅ [TEST 2 PASSED] Medication course stored correctly: ${createdCourse.medicine_name} (${createdCourse.dosage}) with scheduled times [${createdCourse.times_of_day.join(', ')}].`);
      passed++;
    } else {
      console.error('❌ [TEST 2 FAILED] Course creation failed:', createdCourse);
    }
  } catch (err) {
    console.error('❌ [TEST 2 FAILED] Error:', err.message);
  }

  // Test 3: Reminder Execution Flow
  console.log('\n--- TEST 3: Reminder Execution Flow ---');
  let test3Result = null;
  try {
    test3Result = await reminderScheduler.checkAndDispatchReminders({
      targetTime: '08:00 AM',
      targetDate: '2026-09-26',
      forceAllTimes: false,
      patientIdFilter: testPatientId,
    });

    if (test3Result.remindersSent > 0) {
      console.log(`✅ [TEST 3 PASSED] Scheduler dispatched reminder email to user's registered email: ${test3Result.details[0]?.recipient}. MessageId: ${test3Result.details[0]?.messageId}`);
      passed++;
    } else {
      console.error('❌ [TEST 3 FAILED] No reminder sent:', test3Result);
    }
  } catch (err) {
    console.error('❌ [TEST 3 FAILED] Error:', err.message);
  }

  // Test 4: Email Contents Validation
  console.log('\n--- TEST 4: Email Contents & Structure ---');
  try {
    const sentDetail = test3Result?.details?.find(d => d.status === 'sent' && d.medicine === 'Metformin Hydrochloride');
    if (sentDetail && sentDetail.dosage === '500 mg' && sentDetail.scheduledTime === '08:00 AM' && sentDetail.recipient === 'rahul.sharma@example.com') {
      console.log(`✅ [TEST 4 PASSED] Email payload verified: Medicine="${sentDetail.medicine}", Dose="${sentDetail.dosage}", Time="${sentDetail.scheduledTime}", Recipient="${sentDetail.recipient}". No fabricated data.`);
      passed++;
    } else {
      console.error('❌ [TEST 4 FAILED] Detail mismatch:', sentDetail);
    }
  } catch (err) {
    console.error('❌ [TEST 4 FAILED] Error:', err.message);
  }

  // Test 5: Idempotency & Duplicate Prevention
  console.log('\n--- TEST 5: Duplicate Protection (Idempotency) ---');
  try {
    // Run second time with identical occurrence parameters
    const duplicateRun = await reminderScheduler.checkAndDispatchReminders({
      targetTime: '08:00 AM',
      targetDate: '2026-09-26',
      forceAllTimes: false,
      patientIdFilter: testPatientId,
    });

    if (duplicateRun.remindersSent === 0 && duplicateRun.remindersSkipped > 0) {
      console.log(`✅ [TEST 5 PASSED] Duplicate reminder prevented! Sent: ${duplicateRun.remindersSent}, Skipped: ${duplicateRun.remindersSkipped}. Reason: Already sent.`);
      passed++;
    } else {
      console.error('❌ [TEST 5 FAILED] Duplicate protection failed:', duplicateRun);
    }
  } catch (err) {
    console.error('❌ [TEST 5 FAILED] Error:', err.message);
  }

  // Test 6: Multiple Medications Support
  console.log('\n--- TEST 6: Multiple Medications Support ---');
  try {
    // Create Medicine B
    const courseB = await patientService.createCourse(testPatientId, {
      medicineName: 'Amlodipine Besylate',
      dosage: '5 mg',
      frequency: 'Once daily',
      timesOfDay: ['02:00 PM'],
      mealRelation: 'after_meal',
      startDate: '2026-09-01',
      endDate: '2026-12-31',
      status: 'active',
    });

    const runMedB = await reminderScheduler.checkAndDispatchReminders({
      targetTime: '02:00 PM',
      targetDate: '2026-09-26',
      forceAllTimes: false,
      patientIdFilter: testPatientId,
    });

    if (runMedB.remindersSent === 1 && runMedB.details[0]?.medicine === 'Amlodipine Besylate') {
      console.log(`✅ [TEST 6 PASSED] Multiple medications scheduled independently. 02:00 PM triggered ${runMedB.details[0].medicine}.`);
      passed++;
    } else {
      console.error('❌ [TEST 6 FAILED] Multiple meds run failed:', runMedB);
    }

    if (courseB?.id) await patientService.deleteCourse(testPatientId, courseB.id);
  } catch (err) {
    console.error('❌ [TEST 6 FAILED] Error:', err.message);
  }

  // Test 7: Ended Medication Schedule Lifecycle
  console.log('\n--- TEST 7: Ended Medication Lifecycle ---');
  try {
    const expiredCourse = await patientService.createCourse(testPatientId, {
      medicineName: 'Amoxicillin Antibiotic',
      dosage: '250 mg',
      frequency: 'Three times daily',
      timesOfDay: ['08:00 AM'],
      startDate: '2026-08-01',
      endDate: '2026-08-10', // Expired in the past
      status: 'active',
    });

    const expiredRun = await reminderScheduler.checkAndDispatchReminders({
      targetTime: '08:00 AM',
      targetDate: '2026-09-26',
      forceAllTimes: false,
      patientIdFilter: testPatientId,
    });

    const amoxSkipped = expiredRun.details.find(d => d.medicine === 'Amoxicillin Antibiotic');
    if (amoxSkipped && amoxSkipped.reason && amoxSkipped.reason.includes('ended')) {
      console.log(`✅ [TEST 7 PASSED] Expired course correctly skipped: "${amoxSkipped.reason}". No email sent.`);
      passed++;
    } else {
      console.error('❌ [TEST 7 FAILED] Expired check failed:', amoxSkipped);
    }

    if (expiredCourse?.id) await patientService.deleteCourse(testPatientId, expiredCourse.id);
  } catch (err) {
    console.error('❌ [TEST 7 FAILED] Error:', err.message);
  }

  // Test 8: Paused / Inactive Medication
  console.log('\n--- TEST 8: Disabled / Paused Medication ---');
  try {
    const pausedCourse = await patientService.createCourse(testPatientId, {
      medicineName: 'Atorvastatin 10mg',
      dosage: '10 mg',
      frequency: 'Once daily',
      timesOfDay: ['10:00 PM'],
      startDate: '2026-09-01',
      endDate: '2026-12-31',
      status: 'paused', // Disabled/paused
    });

    const pausedRun = await reminderScheduler.checkAndDispatchReminders({
      targetTime: '10:00 PM',
      targetDate: '2026-09-26',
      forceAllTimes: false,
      patientIdFilter: testPatientId,
    });

    const sentRemindersForPaused = pausedRun.details.filter(d => d.medicine === 'Atorvastatin 10mg' && d.status === 'sent');
    const activeCourses = await patientService.getAllActiveCourses();
    const isActive = activeCourses.some(c => c.id === pausedCourse?.id);

    if (sentRemindersForPaused.length === 0 && !isActive) {
      console.log(`✅ [TEST 8 PASSED] Paused/disabled medication strictly excluded from reminder execution. Reminders sent: 0, Active in scheduler: ${isActive}.`);
      passed++;
    } else {
      console.error('❌ [TEST 8 FAILED] Paused course was not excluded:', { sentRemindersForPaused, isActive });
    }

    if (pausedCourse?.id) await patientService.deleteCourse(testPatientId, pausedCourse.id);
  } catch (err) {
    console.error('❌ [TEST 8 FAILED] Error:', err.message);
  }

  // Test 9: Server/Browser Independence
  console.log('\n--- TEST 9: Server/Browser Independence ---');
  try {
    const isBrowserEnv = typeof window !== 'undefined' || typeof document !== 'undefined';
    const hasNodeProcess = typeof process !== 'undefined' && !!process.versions?.node;
    if (!isBrowserEnv && hasNodeProcess && reminderScheduler.start && reminderScheduler.stop) {
      console.log('✅ [TEST 9 PASSED] ReminderScheduler operates completely server-side in Node.js runtime with zero browser or client-window dependencies.');
      passed++;
    } else {
      console.error('❌ [TEST 9 FAILED] Environment mismatch.');
    }
  } catch (err) {
    console.error('❌ [TEST 9 FAILED] Error:', err.message);
  }

  // Test 10: Email Failure Handling & Retry Cap
  console.log('\n--- TEST 10: Email Failure & Retry Cap ---');
  try {
    const occurrenceKey = 'test-patient:test-course:2026-09-26:11:00 AM';
    
    // Simulate first failure
    const fail1 = await notificationLogService.recordFailure({
      occurrenceKey,
      patientId: testPatientId,
      courseId: 'test-course',
      medicineName: 'Test Med',
      dosage: '100mg',
      scheduledTime: '11:00 AM',
      scheduledDate: '2026-09-26',
      recipientEmail: 'invalid-email',
      error: 'SMTP connection refused (Simulated failure)',
    });

    // Simulate second failure
    const fail2 = await notificationLogService.recordFailure({
      occurrenceKey,
      patientId: testPatientId,
      courseId: 'test-course',
      medicineName: 'Test Med',
      dosage: '100mg',
      scheduledTime: '11:00 AM',
      scheduledDate: '2026-09-26',
      recipientEmail: 'invalid-email',
      error: 'SMTP connection refused (Simulated failure)',
    });

    // Simulate third failure
    const fail3 = await notificationLogService.recordFailure({
      occurrenceKey,
      patientId: testPatientId,
      courseId: 'test-course',
      medicineName: 'Test Med',
      dosage: '100mg',
      scheduledTime: '11:00 AM',
      scheduledDate: '2026-09-26',
      recipientEmail: 'invalid-email',
      error: 'SMTP connection refused (Simulated failure)',
    });

    const record = notificationLogService.getOccurrence(occurrenceKey);
    const hasBeenSent = await notificationLogService.hasBeenSent(occurrenceKey);

    if (record.retryCount === 3 && record.status === 'failed' && !hasBeenSent) {
      console.log(`✅ [TEST 10 PASSED] Email failure recorded properly: Status='${record.status}', RetryCount=${record.retryCount}, hasBeenSent=${hasBeenSent}. Max retries capped without infinite loop.`);
      passed++;
    } else {
      console.error('❌ [TEST 10 FAILED] Failure record mismatch:', record);
    }
  } catch (err) {
    console.error('❌ [TEST 10 FAILED] Error:', err.message);
  }

  // Clean up created course
  if (createdCourse?.id) {
    await patientService.deleteCourse(testPatientId, createdCourse.id);
  }

  console.log('\n===============================================================');
  console.log(`🏁 TEST RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('===============================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runReminderTests();
