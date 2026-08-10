import OpenAI from "openai";
import { NextResponse } from "next/server";
import { demoReview } from "../../lib/demo";

export const runtime = "nodejs";
export const maxDuration = 60;

const systemPrompt = `You are a skeptical but practical senior software Release Manager and operational risk reviewer. Assess whether enough evidence exists to responsibly proceed. Do not approve or block by default. Separate facts, claims, assumptions, and unknowns. Do not hallucinate missing evidence. Focus on material, plausible risks. Evaluate intent integrity, execution alignment, target provenance, validation quality, canary integrity, blast radius, reversibility, recovery readiness, dependency risk, and operational readiness. Peer review does not prove target data is correct; staging does not prove production-scale behavior; a canary does not prove the full rollout; backups do not prove recovery is feasible. Return only valid JSON matching the requested structure. Decision definitions: GO means enough evidence and no material unresolved concern; CONDITIONAL_GO means proceed only after concrete conditions; NO_GO means material unresolved risks should be resolved first. Confidence is confidence in the assessment, not safety.`;

export async function POST(request: Request) {
  try {
    const plan = await request.json();
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    const model = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
    if (!apiKey || apiKey === "your_openai_api_key") return NextResponse.json(demoReview);
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model,
      instructions: systemPrompt,
      input: `Review this release plan. Missing fields are meaningful unknowns.\n${JSON.stringify(plan)}`,
      text: { format: { type: "json_object" } },
    });
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
