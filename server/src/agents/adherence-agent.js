export class AdherenceAgent {
  /**
   * Deterministic adherence rate calculation:
   * Rate = (Completed Doses / Total Doses) * 100
   */
  calculateAdherence(doses = []) {
    if (!Array.isArray(doses) || doses.length === 0) {
      return { adherenceRate: 100, totalDoses: 0, takenDoses: 0, missedDoses: 0 };
    }

    const taken = doses.filter(d => d.status === 'taken').length;
    const missed = doses.filter(d => d.status === 'missed').length;
    const total = doses.length;

    const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 100;

    return {
      adherenceRate,
      totalDoses: total,
      takenDoses: taken,
      missedDoses: missed,
      deterministic: true,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Deterministic missed dose evaluation
   */
  detectMissedDose(scheduledTimeStr, scheduledDateStr, graceMinutes = 60) {
    const scheduledDateTime = new Date(`${scheduledDateStr} ${scheduledTimeStr}`);
    const now = new Date();
    const diffMs = now.getTime() - scheduledDateTime.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    return {
      isMissed: diffMinutes > graceMinutes,
      minutesOverdue: diffMinutes > 0 ? diffMinutes : 0
    };
  }
}
