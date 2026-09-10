type RequestLike = {
  method?: string;
  body?: unknown;
};

type ResponseLike = {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => void;
};

type AIResult = {
  domain: string;
  priority: string;
  impactScore: number;
  relatedDomains: string[];
  potentialSkills: string[];
  suggestedTechnologies: string[];
  duplicateRisk: string;
};

const ALLOWED_DOMAINS = [
  "Education", "Agriculture", "Healthcare", "Water", "Environment", "Energy",
  "Urban Development", "Accessibility", "Public Administration", "Rural Livelihoods",
  "Sanitation", "Infrastructure",
];

const ALLOWED_PRIORITIES = ["Low", "Medium", "High", "Critical"];
const ALLOWED_DUPLICATE_RISK = ["Low", "Medium", "High"];

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "AI service is not configured" });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const affectedPopulation = Number(body.affectedPopulation);

  if (!title || !description || !Number.isFinite(affectedPopulation)) {
    res.status(400).json({ error: "title, description and affectedPopulation are required" });
    return;
  }

  const model = process.env.OPENAI_MODEL || "gpt-5-mini";
  const system = `You are the AI triage engine for Jharkhand Innovation Connect (JIC).
Analyze a citizen-reported public problem and return ONLY valid JSON.
Choose domain from: ${ALLOWED_DOMAINS.join(", ")}.
Choose priority from: ${ALLOWED_PRIORITIES.join(", ")}.
Choose duplicateRisk from: ${ALLOWED_DUPLICATE_RISK.join(", ")}.
impactScore must be a number from 0 to 5.
relatedDomains, potentialSkills and suggestedTechnologies must each contain 3 to 5 concise strings.
Prioritize practical Indian field deployment, low-connectivity settings, affordability and maintainability.
Do not invent statistics or claim that a solution is proven.`;

  const user = JSON.stringify({ title, description, affectedPopulation });

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          { role: "system", content: [{ type: "input_text", text: system }] },
          { role: "user", content: [{ type: "input_text", text: user }] },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "jic_ai_analysis",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                domain: { type: "string", enum: ALLOWED_DOMAINS },
                priority: { type: "string", enum: ALLOWED_PRIORITIES },
                impactScore: { type: "number", minimum: 0, maximum: 5 },
                relatedDomains: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
                potentialSkills: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
                suggestedTechnologies: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
                duplicateRisk: { type: "string", enum: ALLOWED_DUPLICATE_RISK },
              },
              required: ["domain", "priority", "impactScore", "relatedDomains", "potentialSkills", "suggestedTechnologies", "duplicateRisk"],
            },
          },
        },
        max_output_tokens: 700,
      }),
    });

    const data = await response.json().catch(() => null) as Record<string, unknown> | null;
    if (!response.ok) {
      const message = typeof data?.error === "object" && data.error && "message" in data.error
        ? String((data.error as Record<string, unknown>).message)
        : "OpenAI request failed";
      res.status(502).json({ error: message });
      return;
    }

    const outputText = extractOutputText(data);
    if (!outputText) throw new Error("AI returned no structured output");

    const result = JSON.parse(outputText) as AIResult;
    res.status(200).json(result);
  } catch (error) {
    console.error("JIC AI analysis failed", error);
    res.status(502).json({ error: "AI analysis failed" });
  }
}

function extractOutputText(data: Record<string, unknown>): string | null {
  if (typeof data.output_text === "string") return data.output_text;

  const output = Array.isArray(data.output) ? data.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as Record<string, unknown>).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string") {
        return (part as Record<string, unknown>).text as string;
      }
    }
  }
  return null;
}
