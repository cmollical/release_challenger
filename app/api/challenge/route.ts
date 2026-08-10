import OpenAI from "openai";
import { NextResponse } from "next/server";
import { demoReview } from "../../lib/demo";

export const runtime = "nodejs";
export const maxDuration = 60;

const systemPrompt = `You are a skeptical but practical senior software Release Manager and operational risk reviewer. Assess whether enough evidence exists to responsibly proceed. Do not approve or block by default. Separate facts, claims, assumptions, and unknowns. Do not hallucinate missing evidence. Focus on material, plausible risks. Evaluate intent integrity, execution alignment, target provenance, validation quality, canary integrity, blast radius, reversibility, recovery readiness, dependency risk, and operational readiness.

Core release-management principles:
- A statement that something was reviewed, tested, backed up, or canaried is not proof that the relevant assumption was demonstrated.
- Unknowns must remain explicitly unknown. Never fill missing evidence with a favorable assumption.
- Prioritize risks approximately in this order when applicable: whether execution targets the right thing; whether production inputs are trustworthy; whether validation proves the relevant assumptions; what happens if those assumptions are wrong; whether recovery is operationally feasible; then scale and performance concerns.
- Batch size, timeouts, rate limits, and performance remain valid considerations, but do not let generic scale concerns dominate more fundamental evidence-integrity questions.

Semantic target validation:
When execution operates against identifiers, records, hosts, tenants, accounts, configuration values, files, resources, or other supplied targets, do not only ask whether the list is accurate and complete. Determine what kind of object each target actually resolves to, whether that object type matches the object described in the release objective, and whether the target type has been independently or programmatically verified. Consider whether the same operation or API could behave differently depending on the type or scope of target supplied. A perfectly accurate list of the wrong kind of object is still unsafe. Treat an unverified relationship between stated target type and actual execution target type as a material intent/execution risk, especially for destructive, customer-facing, data-changing, or potentially irreversible changes.

Intent versus execution:
Compare the nouns and scope in the objective with the nouns and scope in the actual execution. If the objective says to modify or remove X but the execution runs operation Y against supplied identifiers, ask whether there is evidence that those targets actually resolve to X. Do not mark intent/execution as aligned merely because the action sounds broadly related to the objective.

Canary evidence equivalence:
Evaluate a canary by the assumptions it tested, not primarily by sample size. Explicitly compare the canary and full rollout across target-generation process, data provenance, input validation, object/resource type, execution path, operator or handoff process, configuration, environment, and scale. A successful canary supports the full rollout only for assumptions the canary actually tested. If the current production population was generated separately from the canary population, require evidence that both populations were produced and validated using equivalent controls.

Blast radius under assumption failure:
For destructive, customer-facing, data-changing, or potentially irreversible operations, assess blast radius under the scenario that the target identity or scope assumption is wrong. Do not limit the analysis to the intended target count. Ask: if these targets resolve to a broader or different resource than intended, what could the operation affect? Identify only plausible consequences supported by the release context; do not invent unsupported system behavior.

Conditions to proceed:
When target identity is material, suggest concrete evidence such as programmatically resolving targets and verifying resource/object type, independently reconciling the population against an authoritative source, verifying the full population with the same controls as the canary, or sampling and inspecting resolved targets before destructive execution. Use these conditions only when relevant to the release.

Return only valid JSON matching the requested structure. Decision definitions: GO means enough evidence and no material unresolved concern; CONDITIONAL_GO means proceed only after concrete conditions; NO_GO means material unresolved risks should be resolved first. Confidence is confidence in the assessment, not safety.`;

const reviewSchema = {
  type: "object",
  additionalProperties: false,
  required: ["decision", "confidence", "risk_level", "executive_summary", "critical_assumptions", "intent_execution", "validation_gaps", "blast_radius", "recovery_readiness", "conditions_to_proceed", "release_manager_questions"],
  properties: {
    decision: { type: "string", enum: ["GO", "CONDITIONAL_GO", "NO_GO"] },
    confidence: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
    risk_level: { type: "string", enum: ["LOW", "MODERATE", "HIGH", "CRITICAL"] },
    executive_summary: { type: "string" },
    critical_assumptions: { type: "array", items: { type: "object", additionalProperties: false, required: ["assumption", "status", "why_it_matters", "evidence_needed"], properties: { assumption: { type: "string" }, status: { type: "string", enum: ["VERIFIED", "PARTIALLY_VERIFIED", "UNVERIFIED"] }, why_it_matters: { type: "string" }, evidence_needed: { type: "string" } } } },
    intent_execution: { type: "object", additionalProperties: false, required: ["status", "objective", "execution", "finding"], properties: { status: { type: "string", enum: ["ALIGNED", "PARTIALLY_ALIGNED", "MISMATCH_RISK"] }, objective: { type: "string" }, execution: { type: "string" }, finding: { type: "string" } } },
    validation_gaps: { type: "array", items: { type: "object", additionalProperties: false, required: ["title", "finding", "evidence_needed"], properties: { title: { type: "string" }, finding: { type: "string" }, evidence_needed: { type: "string" } } } },
    blast_radius: { type: "object", additionalProperties: false, required: ["severity", "intended_impact", "plausible_failure_impact", "analysis"], properties: { severity: { type: "string", enum: ["LOW", "MODERATE", "HIGH", "CRITICAL"] }, intended_impact: { type: "string" }, plausible_failure_impact: { type: "string" }, analysis: { type: "string" } } },
    recovery_readiness: { type: "object", additionalProperties: false, required: ["status", "backup_status", "restoration_tested", "scale_tested", "recovery_independence", "analysis"], properties: { status: { type: "string", enum: ["HIGH", "MODERATE", "LOW", "UNKNOWN"] }, backup_status: { type: "string", enum: ["CONFIRMED", "CLAIMED", "NOT_PROVIDED", "NOT_APPLICABLE"] }, restoration_tested: { type: "string", enum: ["YES", "PARTIAL", "NO", "UNKNOWN", "NOT_APPLICABLE"] }, scale_tested: { type: "string", enum: ["YES", "PARTIAL", "NO_EVIDENCE", "UNKNOWN", "NOT_APPLICABLE"] }, recovery_independence: { type: "string", enum: ["CONFIRMED", "UNCERTAIN", "AT_RISK", "UNKNOWN", "NOT_APPLICABLE"] }, analysis: { type: "string" } } },
    conditions_to_proceed: { type: "array", items: { type: "string" } },
    release_manager_questions: { type: "array", items: { type: "string" } },
  },
} as const;

export async function POST(request: Request) {
  try {
    const plan = await request.json();
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    const model = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
    if (!apiKey || apiKey === "your_openai_api_key") return NextResponse.json(demoReview);
    const client = new OpenAI({ apiKey });
    const requestBody = { instructions: systemPrompt, input: `Review this release plan. Missing fields are meaningful unknowns.\n${JSON.stringify(plan)}`, text: { format: { type: "json_schema" as const, name: "release_review", strict: true, schema: reviewSchema } } };
    let response;
    try {
      response = await client.responses.create({ ...requestBody, model });
    } catch (error) {
      const isMissingModel = typeof error === "object" && error !== null && "code" in error && error.code === "model_not_found";
      if (!isMissingModel || model === "gpt-4.1-mini") throw error;
      console.warn(`Configured OPENAI_MODEL "${model}" was not found; retrying with gpt-4.1-mini.`);
      response = await client.responses.create({ ...requestBody, model: "gpt-4.1-mini" });
    }
    const raw = response.output_text;
    const review = JSON.parse(raw);
    if (!review.decision || !review.executive_summary || !review.blast_radius) throw new Error("Invalid review");
    return NextResponse.json(review);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    console.error("Challenge request failed:", detail);
    return NextResponse.json({ error: "We couldn't complete the review. Check your connection and try again." }, { status: 500 });
  }
}
