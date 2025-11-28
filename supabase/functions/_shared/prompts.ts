// @ts-nocheck
// deno-lint-ignore-file

/**
 * Get category label from category ID
 */
export async function getCategoryLabelFromId(
  supabaseAdmin: any,
  categoryId: string
): Promise<string> {
  const { data: categoryData, error: categoryError } = await supabaseAdmin
    .from("categories")
    .select("label")
    .eq("id", categoryId)
    .single();
  
  if (categoryError || !categoryData) {
    throw new Error("Failed to fetch category: " + (categoryError?.message || "Unknown error"));
  }
  
  return categoryData.label;
}

/**
 * Get advice details from advice ID
 */
export async function getAdviceFromId(
  supabaseAdmin: any,
  adviceId: string
): Promise<{ name: string; description: string }> {
  const { data: adviceData, error: adviceError } = await supabaseAdmin
    .from("category_advices")
    .select("name, description")
    .eq("id", adviceId)
    .single();
  
  if (adviceError || !adviceData) {
    throw new Error("Failed to fetch advice: " + (adviceError?.message || "Unknown error"));
  }
  
  return {
    name: adviceData.name,
    description: adviceData.description,
  };
}

/**
 * Get user preferences from database
 */
export async function getUserPreferences(
  supabaseAdmin: any,
  userId: string
): Promise<any[]> {
  const { data: preferences, error: preferencesError } = await supabaseAdmin
    .from("user_preferences")
    .select("question_key, answer_value, answer_values, answer_number")
    .eq("user_id", userId);
  
  if (preferencesError) {
    console.warn("[preferences] Error fetching user preferences (non-fatal):", preferencesError);
    return [];
  }
  
  return preferences || [];
}

/**
 * Format user preferences for inclusion in prompt
 */
export async function formatUserPreferences(
  supabaseAdmin: any,
  preferences: any[]
): Promise<string> {
  if (!preferences || preferences.length === 0) {
    return "";
  }
  
  const questionKeys = preferences.map(p => p.question_key);
  const { data: questions, error: questionsError } = await supabaseAdmin
    .from("preference_questions")
    .select("question_key, question_text, question_type, options")
    .in("question_key", questionKeys);
  
  if (questionsError) {
    console.warn("[preferences] Error fetching question texts (non-fatal):", questionsError);
  }
  
  const questionsMap = new Map();
  if (questions) {
    questions.forEach(q => questionsMap.set(q.question_key, q));
  }
  
  let formatted = "\n\nUser Gaming Profile:\n";
  
  for (const pref of preferences) {
    const question = questionsMap.get(pref.question_key);
    const questionText = question?.question_text || pref.question_key;
    
    let answerText = "";
    
    if (pref.answer_value) {
      if (question?.options?.options) {
        const option = question.options.options.find((opt: any) => opt.value === pref.answer_value);
        answerText = option?.label || pref.answer_value;
      } else {
        answerText = pref.answer_value;
      }
    } else if (pref.answer_values && pref.answer_values.length > 0) {
      if (question?.options?.options) {
        const labels = pref.answer_values.map((val: string) => {
          const option = question.options.options.find((opt: any) => opt.value === val);
          return option?.label || val;
        });
        answerText = labels.join(", ");
      } else {
        answerText = pref.answer_values.join(", ");
      }
    } else if (pref.answer_number !== null && pref.answer_number !== undefined) {
      answerText = String(pref.answer_number);
    }
    
    if (answerText) {
      formatted += `- ${questionText}: ${answerText}\n`;
    }
  }
  
  return formatted;
}

/**
 * Get prompt text from database for a category
 */
export async function getPromptFromDatabase(
  supabaseAdmin: any,
  categoryId: string
): Promise<string> {
  const { data: promptData, error: promptError } = await supabaseAdmin
    .from("prompts")
    .select("prompt_text")
    .eq("category_id", categoryId)
    .single();
  
  if (promptError || !promptData) {
    throw new Error("Failed to fetch prompt: " + (promptError?.message || "Unknown error"));
  }
  
  return promptData.prompt_text;
}

/**
 * Build the user prompt with advice, preferences, and OCR text
 */
export async function buildUserPrompt(
  supabaseAdmin: any,
  ocrText: string,
  categoryLabel: string,
  adviceId: string,
  userId: string,
  imageCount: number
): Promise<string> {
  let prompt = "";
  
  const advice = await getAdviceFromId(supabaseAdmin, adviceId);
  const preferences = await getUserPreferences(supabaseAdmin, userId);
  const preferencesText = await formatUserPreferences(supabaseAdmin, preferences);
  
  prompt += `Advice Type: ${advice.name}\n`;
  prompt += `Advice Description: ${advice.description}\n\n`;
  
  if (preferencesText) {
    prompt += preferencesText + "\n";
  }
  
  if (ocrText && ocrText.trim().length > 0) {
    if (imageCount > 1) {
      prompt += `Here is the text extracted from ${imageCount} game screenshots:\n\n${ocrText}\n\n`;
    } else {
      prompt += `Here is the text extracted from a game screenshot:\n\n${ocrText}\n\n`;
    }
    prompt += "Please analyze this and provide helpful recommendations.";
  } else {
    if (imageCount > 1) {
      prompt += `I'm analyzing ${imageCount} game screenshots, but no readable text was extracted from them. Please provide general recommendations based on the ${categoryLabel} category and what you might typically see in game screenshots.`;
    } else {
      prompt += `I'm analyzing a game screenshot, but no readable text was extracted from it. Please provide general recommendations based on the ${categoryLabel} category and what you might typically see in game screenshots.`;
    }
  }
  
  return prompt;
}

