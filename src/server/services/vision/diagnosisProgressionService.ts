import { ProgressionAnalysisResult, ProgressionTrend, SeverityChange } from './types';
import { DiagnosisRecord, SeverityLevel } from '../../../types';

const SEVERITY_SCORES: Record<SeverityLevel, number> = {
  LOW: 1,
  MODERATE: 2,
  HIGH: 3,
  CRITICAL: 4
};

export class DiagnosisProgressionService {
  /**
   * Compares a current diagnosis against historical diagnoses for the same plot/crop.
   */
  public evaluateProgression(
    currentSeverity: SeverityLevel,
    currentDate: Date = new Date(),
    previousDiagnoses: DiagnosisRecord[] = []
  ): ProgressionAnalysisResult {
    if (!previousDiagnoses || previousDiagnoses.length === 0) {
      return {
        progression: 'BASELINE',
        severityTrend: 'NONE',
        currentSeverity,
        details: 'Initial baseline scan recorded for this crop plot. Future scans will track disease progression.'
      };
    }

    // Sort descending by timestamp so index 0 is the most recent prior diagnosis
    const sorted = [...previousDiagnoses].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const latestPrevious = sorted[0];
    const prevSeverity = (latestPrevious.aiSeverity || 'MODERATE') as SeverityLevel;
    const prevDate = new Date(latestPrevious.timestamp);

    const currentScore = SEVERITY_SCORES[currentSeverity] || 2;
    const prevScore = SEVERITY_SCORES[prevSeverity] || 2;

    const diffDays = Math.max(0, Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)));
    const dateFormatted = prevDate.toISOString().split('T')[0];

    let progression: ProgressionTrend = 'STABLE';
    let severityTrend: SeverityChange = 'SAME';
    let details = '';

    if (currentScore > prevScore) {
      progression = 'INCREASING';
      severityTrend = 'INCREASED';
      details = `Disease severity escalated from ${prevSeverity} to ${currentSeverity} over ${diffDays === 0 ? 'the last 24 hours' : `${diffDays} days`} (previous scan on ${dateFormatted}). Lesion expansion detected; immediate therapeutic intervention required.`;
    } else if (currentScore < prevScore) {
      progression = 'IMPROVING';
      severityTrend = 'DECREASED';
      details = `Disease severity improved from ${prevSeverity} to ${currentSeverity} over ${diffDays === 0 ? 'the last 24 hours' : `${diffDays} days`} (previous scan on ${dateFormatted}). Symptoms show lesion drying and restricted spread following management practices.`;
    } else {
      progression = 'STABLE';
      severityTrend = 'SAME';
      details = `Disease severity remains ${currentSeverity}, consistent with previous scan on ${dateFormatted} (${diffDays} days ago). Maintain protective biocontrol and sanitation routines.`;
    }

    return {
      progression,
      severityTrend,
      previousDiagnosisId: latestPrevious.id,
      previousScanDate: latestPrevious.timestamp,
      previousSeverity: prevSeverity,
      currentSeverity,
      daysBetweenScans: diffDays,
      details
    };
  }

  /**
   * Compares two specific diagnosis records directly.
   */
  public compareRecords(currentRecord: DiagnosisRecord, previousRecord: DiagnosisRecord): ProgressionAnalysisResult {
    return this.evaluateProgression(
      currentRecord.aiSeverity as SeverityLevel,
      new Date(currentRecord.timestamp),
      [previousRecord]
    );
  }
}

export const progressionService = new DiagnosisProgressionService();
