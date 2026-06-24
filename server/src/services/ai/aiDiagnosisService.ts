import OpenAI from "openai";
import type { ObdScan } from "../../types/obd.js";
import { buildDiagnosisPrompt } from "./promptBuilder.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

type AiDiagnosis = {
  summary: string;
  severity: "Low" | "Medium" | "High";
  likelyCauses: string[];
  nextSteps: string[];
};

function extractJsonObject(text: string): AiDiagnosis {
  try {
    return JSON.parse(text) as AiDiagnosis;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("AI response did not contain valid JSON.");
    }

    const jsonText = text.slice(start, end + 1);
    return JSON.parse(jsonText) as AiDiagnosis;
  }
}

export async function getRealAiDiagnosis(scan: ObdScan): Promise<AiDiagnosis> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in server/.env");
  }

  const diagnosticPrompt = buildDiagnosisPrompt(scan);

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    instructions: `
You are an automotive diagnostic assistant for a technician.

Use the provided OBD2 scan data to produce a practical diagnosis.

Rules:
- Do not claim certainty.
- Do not tell the user to replace parts blindly.
- Prioritize diagnostic testing.
- Keep the answer useful for a mechanic.
- Return only valid JSON.
- The JSON must match this exact shape:

{
  "summary": "string",
  "severity": "Low" | "Medium" | "High",
  "likelyCauses": ["string"],
  "nextSteps": ["string"]
}
`,
    input: diagnosticPrompt,
    temperature: 0.2
  });

  const outputText = response.output_text;

  if (!outputText) {
    throw new Error("OpenAI returned an empty response.");
  }

  return extractJsonObject(outputText);
}
