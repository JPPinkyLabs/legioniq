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
    .select("question_key, options")
    .in("question_key", questionKeys);
  
  if (questionsError) {
    console.warn("[preferences] Error fetching question options (non-fatal):", questionsError);
  }
  
  const questionsMap = new Map();
  if (questions) {
    questions.forEach(q => questionsMap.set(q.question_key, q));
  }
  
  let formatted = "";
  
  for (const pref of preferences) {
    const question = questionsMap.get(pref.question_key);
    const questionKey = pref.question_key;
    
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
      formatted += `${questionKey}: ${answerText}\n`;
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
  const advice = await getAdviceFromId(supabaseAdmin, adviceId);
  const preferences = await getUserPreferences(supabaseAdmin, userId);
  const preferencesText = await formatUserPreferences(supabaseAdmin, preferences);
  
  let prompt = `I need an analysis on ${advice.name.toLowerCase()}. ${advice.description}`;
  
  if (preferencesText && preferencesText.trim().length > 0) {
    prompt += `\n\nConsidering my gaming profile:\n${preferencesText}`;
  }
  
  if (ocrText && ocrText.trim().length > 0) {
    const imageText = imageCount > 1 
      ? `text extracted from ${imageCount} game screenshots` 
      : `text extracted from a game screenshot`;
    
    prompt += `\n\nBelow is the ${imageText} related to this ${advice.name.toLowerCase()} analysis:\n\n${ocrText}\n\nPlease analyze all this data and provide helpful recommendations considering the game context, my gaming profile, and the information extracted from the images.`;
  } else {
    const imageText = imageCount > 1 
      ? `${imageCount} game screenshots` 
      : `a game screenshot`;
    
    prompt += `\n\nI'm analyzing ${imageText} related to ${advice.name.toLowerCase()}, but no readable text could be extracted. Please provide general recommendations based on the ${categoryLabel} category and what you would typically see in game screenshots related to this type of analysis.`;
  }
  
  return prompt;
}

