import { askTSolver } from './gemini';

class AIEngine {
  private initialized = false;

  async init() {
    this.initialized = true;
    console.log("AI Engine Ready");
  }

  async process(prompt: string, category: 'math' | 'education' | 'business' | 'general' = 'general', useThinking: boolean = false, userLevel?: string, imageBase64?: string): Promise<string> {
    const p = prompt.trim();
    if (!p && !imageBase64) return "";
    const lang = localStorage.getItem('tsolver-lang') || 'bn';

    try {
      const result = await askTSolver(prompt || "Please describe this image.", imageBase64, useThinking, category, userLevel);
      if (result) return result;
      return lang === 'bn' 
        ? "দুঃখিত, কোনো উত্তর পাওয়া যায়নি।" 
        : "Sorry, no response generated.";
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      return `API Error: ${err.message || 'Unknown error occurred.'}`;
    }
  }
}

export const localAI = new AIEngine();
