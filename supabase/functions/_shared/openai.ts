// @ts-nocheck
// deno-lint-ignore-file

/**
 * Call OpenAI API with the given prompts
 * @returns AI response text
 */
export async function callOpenAI(
  userPrompt: string,
  systemPrompt: string
): Promise<string> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  const openaiModel = Deno.env.get("OPENAI_MODEL") || "gpt-4o";
  
  if (!openaiApiKey) {
    throw new Error("OpenAI API key not configured");
  }

  console.log("=== OPENAI REQUEST ===");
  console.log("[OpenAI] Model:", openaiModel);
  console.log("[OpenAI] System Prompt:", systemPrompt);
  console.log("[OpenAI] User Prompt:", userPrompt);
  console.log("=== END PROMPTS ===");
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: openaiModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error("[OpenAI] API Error:", data.error);
    throw new Error("OpenAI API failed: " + (data.error?.message || "Unknown error"));
  }

  const aiResponse = data.choices[0].message.content;
  console.log("=== OPENAI RESPONSE ===");
  console.log("[OpenAI] Response:", aiResponse);
  console.log("[OpenAI] Usage:", JSON.stringify(data.usage));
  console.log("=== END RESPONSE ===");
  
  return aiResponse;
}

/**
 * Get the current OpenAI model from environment
 */
export function getOpenAIModel(): string {
  return Deno.env.get("OPENAI_MODEL") || "gpt-4o";
}

