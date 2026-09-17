import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    domain: { type: "string" },
    priority: { type: "string", enum: ["Low", "Medium", "High", "Critical"] },
    impactScore: { type: "number" },
    impactFactors: {
      type: "object",
      additionalProperties: false,
      properties: {
        population: { type: "number" }, duration: { type: "number" }, severity: { type: "number" },
        essentialService: { type: "number" }, geographicSpread: { type: "number" },
        evidenceConfidence: { type: "number" }, vulnerableGroups: { type: "number" },
      },
      required: ["population", "duration", "severity", "essentialService", "geographicSpread", "evidenceConfidence", "vulnerableGroups"],
    },
    relatedDomains: { type: "array", items: { type: "string" } },
    potentialSkills: { type: "array", items: { type: "string" } },
    suggestedTechnologies: { type: "array", items: { type: "string" } },
    duplicateRisk: { type: "string", enum: ["Low", "Medium", "High"] },
  },
  required: ["domain", "priority", "impactScore", "impactFactors", "relatedDomains", "potentialSkills", "suggestedTechnologies", "duplicateRisk"],
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return json({ error: "OPENAI_API_KEY is not configured" }, 503);

  try {
    const input = await request.json();
    if (typeof input.title !== "string" || typeof input.description !== "string") {
      return json({ error: "title and description are required" }, 400);
    }

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini",
        temperature: 0.1,
        response_format: { type: "json_schema", json_schema: { name: "challenge_analysis", strict: true, schema: responseSchema } },
        messages: [
          { role: "system", content: "You analyze community problems in Jharkhand. Return only the requested JSON. Use one of the supplied domain names. Scores are 1 to 5, impactScore is 0 to 5. Duplicate risk must reflect the provided existing challenge summaries." },
          { role: "user", content: JSON.stringify({ challenge: input, existingChallenges: input.existingChallenges ?? [] }) },
        ],
      }),
    });

    if (!completion.ok) return json({ error: `AI provider returned ${completion.status}` }, 502);
    const payload = await completion.json();
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return json({ error: "AI provider returned no analysis" }, 502);
    return json(JSON.parse(content));
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Analysis failed" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
