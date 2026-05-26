export async function askTSolver(prompt: string, imageBase64?: string, useThinking: boolean = false, mode: string = 'general', userLevel?: string) {
  const OPENROUTER_API_KEY = (import.meta as any).env?.VITE_OPENROUTER_API_KEY || "";

  const isImageGen = /generate image|create image|draw|image of|photo of|ছবির|ছবি তৈরি করো/i.test(prompt);

  let systemInstruction = `You are T-Solver AI Teacher, a world-class educational AI developed by Tachin Ahmed Rion.
  Developer Info:
  - Name: Tachin Ahmed Rion (তাছিন আহমেদ রিয়ন)
  - Identity: Owner & CEO of Vintorex Group, AI Architect, T-Solver Founder.
  
  Pedagogical Goals:
  - Act as an encouraging, patient teacher.
  - Don't just give answers; explain the "why" and "how".
  - Ask questions back to the student to ensure they understand.
  - Give hints if they are stuck.
  - Adapt difficulty based on the provided student level: ${userLevel || 'General'}.
  - If level is 'School', use very simple analogies. If 'University', provide depth and research-level insights.
  - Use LaTeX for all math.
  - Support both English and Bengali seamlessly.`;
  
  if (mode === 'math') {
    systemInstruction += " Use LaTeX for mathematical expressions and provide step-by-step solutions.";
  } else if (mode === 'business') {
    systemInstruction += " Provide professional business insights, data analysis, and strategic advice.";
  } else if (mode === 'education') {
    systemInstruction += " Act as an expert educator, explaining complex concepts in simple terms suitable for students.";
  }

  if (isImageGen) {
    systemInstruction = "You are an AI assistant. The user requested an image, but direct image generation is currently disabled. Please provide a highly detailed text description of what the image would look like instead.";
  }

  const messages: any[] = [
    { role: "system", content: systemInstruction }
  ];

  if (imageBase64) {
    // Ensure data URI format for base64 image
    const base64Data = imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`;
    messages.push({
      role: "user",
      content: [
        { type: "text", text: prompt || "Please analyze this image." },
        { type: "image_url", image_url: { url: base64Data } }
      ]
    });
  } else {
    messages.push({
      role: "user",
      content: prompt
    });
  }

  // OpenRouter models
  const model = useThinking ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash";

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://t-solver-ai.vercel.app", // Optional
        "X-Title": "T-Solver AI", // Optional
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", errorText);
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error?.message || `API Error: ${response.status}`);
      } catch (e) {
        throw new Error(`OpenRouter API Error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (error: any) {
    console.error("OpenRouter Fetch Error:", error);
    throw new Error(error.message || "Failed to connect to T-Solver AI. Please check your connection.");
  }
}
