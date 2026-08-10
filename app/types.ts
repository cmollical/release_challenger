export type ReleasePlan = {
  name: string; objective: string; execution: string; scope: string; provenance: string;
  validation: string; rollout: string; recovery: string; dependencies: string;
  characteristics: string[];
};

export type Review = {
  decision: "GO" | "CONDITIONAL_GO" | "NO_GO";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  risk_level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  executive_summary: string;
  critical_assumptions: { assumption: string; status: string; why_it_matters: string; evidence_needed: string }[];
  intent_execution: { status: string; objective: string; execution: string; finding: string };
  validation_gaps: { title: string; finding: string; evidence_needed: string }[];
  blast_radius: { severity: string; intended_impact: string; plausible_failure_impact: string; analysis: string };
  recovery_readiness: { status: string; backup_status: string; restoration_tested: string; scale_tested: string; recovery_independence: string; analysis: string };
  conditions_to_proceed: string[];
  release_manager_questions: string[];
};
