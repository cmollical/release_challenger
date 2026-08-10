import { ReleasePlan, Review } from "../types";

export const emptyPlan: ReleasePlan = { name: "", objective: "", execution: "", scope: "", provenance: "", validation: "", rollout: "", recovery: "", dependencies: "", characteristics: [] };

export const examplePlan: ReleasePlan = {
  name: "Legacy Asset Management App Cleanup",
  objective: "Remove deprecated standalone asset-management application instances from customer sites following migration of the functionality into the core service-management platform.",
  execution: "Run the existing production deletion script against the supplied list of 883 production identifiers. The script calls an internal deletion API for each identifier.",
  scope: "883 production objects associated with customers who previously used the standalone asset-management application.",
  provenance: "The identifier list was supplied by the team coordinating the cleanup effort. The current batch was generated as part of the final production cleanup.",
  validation: "The deletion script has been peer reviewed and tested in staging. A previous production run against 30 identifiers completed successfully without reported customer impact.",
  rollout: "Execute the supplied population as a production batch using the existing deletion process.",
  recovery: "Affected customer data is backed up and can be restored if necessary.",
  dependencies: "Internal deletion API, customer data backup systems, and restoration tooling.",
  characteristics: ["Destructive"],
};

export const demoReview: Review = {
  decision: "NO_GO", confidence: "HIGH", risk_level: "CRITICAL",
  executive_summary: "The intent is clear, but the release depends on trusting an externally supplied production identifier list that has not been independently reconciled to the intended customer population. The small prior run demonstrates that the deletion path can work; it does not demonstrate that this 883-object target is correct or that restoration is practical at full scale. Resolve target provenance and recovery evidence before proceeding.",
  critical_assumptions: [
    { assumption: "All 883 identifiers represent the intended deprecated objects and no active customer assets.", status: "UNVERIFIED", why_it_matters: "A destructive operation will faithfully act on the supplied list, so an incorrect target can create broad customer impact.", evidence_needed: "An independently generated reconciliation showing source query, population counts, exclusions, and a sample reviewed by the owning team." },
    { assumption: "The deletion API and script behave consistently at the full batch size.", status: "PARTIALLY_VERIFIED", why_it_matters: "A 30-object run provides limited evidence about throughput, retries, partial failure, and rate limits.", evidence_needed: "A production-like scale test with failure handling, idempotency, and observable completion criteria." },
    { assumption: "Backups can be restored within an acceptable customer-impact window.", status: "UNVERIFIED", why_it_matters: "A backup claim alone does not establish restoration speed, completeness, or operator access.", evidence_needed: "A documented restore rehearsal using representative objects and named responders." },
  ],
  intent_execution: { status: "ALIGNED", objective: "Remove deprecated standalone asset-management instances after migration.", execution: "Delete each object represented by a supplied list of 883 production identifiers.", finding: "The mechanism matches the stated cleanup intent, but alignment depends on the target list being a complete and accurate representation of migrated instances." },
  validation_gaps: [
    { title: "Target population is not independently verified", finding: "The evidence describes who supplied the list, not how each identifier was derived or checked against the migration state.", evidence_needed: "Re-run the target query from an authoritative source and compare it to the batch before execution." },
    { title: "Canary does not validate the full change", finding: "The 30-object run supports basic script behavior, but not production-scale behavior or the correctness of this batch.", evidence_needed: "Use a representative canary from this exact batch with pre/post reconciliation and explicit stop criteria." },
    { title: "Recovery is stated, not demonstrated", finding: "Backup availability is not evidence that operators can restore the affected records accurately and quickly.", evidence_needed: "Complete a restore rehearsal and record the expected RTO, tooling path, and ownership." },
  ],
  blast_radius: { severity: "CRITICAL", intended_impact: "883 deprecated objects removed from customer sites.", plausible_failure_impact: "Active or incorrectly targeted customer objects could be deleted across a large production population, with prolonged service disruption if restoration is slow or incomplete.", analysis: "The blast radius is driven by the destructive action and the size of the supplied population. There is no stated automatic stop, rate limit, per-customer boundary, or verified precondition that contains a bad target list." },
  recovery_readiness: { status: "LOW", backup_status: "CLAIMED", restoration_tested: "NO", scale_tested: "NO_EVIDENCE", recovery_independence: "UNCERTAIN", analysis: "Recovery is described as possible, but the plan does not show a tested restoration workflow, full-scale timing, or whether the restoration tooling is independent of the systems being changed." },
  conditions_to_proceed: ["Reconcile the 883 identifiers against an authoritative migration-state query, with ownership sign-off and a retained audit artifact.", "Run a representative canary from this exact batch with pre/post validation, monitoring, and an explicit stop threshold.", "Perform and document a restore rehearsal at representative scale, including RTO, data completeness checks, and named responders.", "Add a bounded rollout with per-customer or batch-level checkpoints, automatic failure handling, and a clear halt mechanism."],
  release_manager_questions: ["Who generated the target list, and can the owning team reproduce it from an authoritative production source?", "What proves that every identifier is migrated and safe to delete today?", "What is the maximum acceptable failure rate before the batch stops?", "How long would it take to restore one customer and the full population, and who is on point?"],
};
