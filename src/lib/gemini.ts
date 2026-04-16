import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResponse {
  prediction: "benign" | "malignant";
  confidence: number;
  risk: number;
  biRads: number;
  guidance: string;
  causes: string[];
  precautions: string[];
  recommendedActions: string[];
  heatmapDescription: string;
}

export async function analyzeMammogram(base64Image: string): Promise<AnalysisResponse> {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `Analyze this mammogram image for potential breast cancer. 
  Provide a structured medical analysis including:
  1. Prediction: benign or malignant
  2. Confidence: 0-100 percentage
  3. Risk Level: 0-100 percentage
  4. BI-RADS score: 1 to 5
  5. Guidance: A concise human-readable explanation
  6. Causes: A list of potential contributing factors for this finding
  7. Precautions: Important health precautions
  8. Recommended Actions: Next clinical steps
  9. Heatmap Description: Describe which specific regions show the highest intensity or concern (e.g. "Upper outer quadrant", "Subareolar region").

  Return EXACTLY a JSON object with these fields: prediction, confidence, risk, biRads, guidance, causes (array), precautions (array), recommendedActions (array), heatmapDescription.
  
  Disclaimer: Include a note that this is an AI screening tool and not a diagnosis.`;

  const result = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] || base64Image } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prediction: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          risk: { type: Type.NUMBER },
          biRads: { type: Type.NUMBER },
          guidance: { type: Type.STRING },
          causes: { type: Type.ARRAY, items: { type: Type.STRING } },
          precautions: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          heatmapDescription: { type: Type.STRING }
        },
        required: ["prediction", "confidence", "risk", "biRads", "guidance", "causes", "precautions", "recommendedActions", "heatmapDescription"]
      }
    }
  });

  try {
    const text = result.text;
    return JSON.parse(text) as AnalysisResponse;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Failed to analyze image correctly.");
  }
}

export async function askDoctor(query: string, context: Partial<AnalysisResponse>, history: any[] = []) {
  const model = "gemini-3-flash-preview";

  const systemPrompt = `You are OncoAI, a specialized AI Doctor Assistant for breast cancer.
  Context of Current Patient:
  - Prediction: ${context.prediction || 'Unknown'}
  - Confidence: ${context.confidence || 0}%
  - Risk Level: ${context.risk || 0}%
  - BI-RADS: ${context.biRads || 'N/A'}
  - Guidance: ${context.guidance || 'N/A'}

  Your Goal:
  - Provide empathetic, professional medical guidance.
  - Explain complex terms simply.
  - Suggest precautions and next steps.
  - ALWAYS include a disclaimer: "This is an AI-assisted screening tool and NOT a medical diagnosis. Please consult a board-certified oncologist."
  - NEVER give a final diagnosis.
  - Reference the patient's specific scan results in your answers.`;

  const formattedHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.content }]
  }));

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: systemPrompt,
    },
    history: formattedHistory
  });

  const response = await chat.sendMessage({ message: query });
  return response.text;
}
