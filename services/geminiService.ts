
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, ComparisonResult, UserType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    simpleExplanation: { type: Type.STRING },
    onePageSummary: { type: Type.STRING },
    riskScore: { type: Type.INTEGER },
    riskLevel: { type: Type.STRING, enum: ["Safe", "Caution", "Risky", "Critical"] },
    verdict: { type: Type.STRING, enum: ["Mostly normal", "Needs attention", "High risk"] },
    verdictReason: { type: Type.STRING },
    redFlags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          location: { type: Type.STRING },
          oneSided: { type: Type.BOOLEAN }
        },
        required: ["title", "description", "severity"]
      }
    },
    financialBreakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          value: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["fee", "penalty", "charge", "other"] },
          frequency: { type: Type.STRING }
        }
      }
    },
    importantDates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          event: { type: Type.STRING },
          deadline: { type: Type.BOOLEAN }
        }
      }
    },
    scamRiskScore: { type: Type.INTEGER },
    scamAnalysis: { type: Type.STRING },
    clauses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          originalTitle: { type: Type.STRING },
          simplifiedExplanation: { type: Type.STRING },
          impact: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative"] }
        }
      }
    },
    questionsToAsk: { type: Type.ARRAY, items: { type: Type.STRING } },
    personalizedWarnings: { type: Type.ARRAY, items: { type: Type.STRING } }
  }
};

const comparisonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    docs: { type: Type.ARRAY, items: analysisSchema },
    comparisonSummary: { type: Type.STRING },
    winner: { type: Type.STRING },
    winnerReason: { type: Type.STRING },
    comparisonTable: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          feature: { type: Type.STRING },
          values: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  }
};

export const analyzeOrCompare = async (
  inputs: { type: 'file' | 'text' | 'url', data: string, mimeType?: string, fileName?: string }[],
  userType: UserType,
  targetLanguage: string = "Simple English"
): Promise<{ analysis?: AnalysisResult, comparison?: ComparisonResult }> => {
  try {
    const isComparison = inputs.length > 1;
    const modelId = isComparison || inputs.some(i => i.type === 'url') ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    
    const instructions = `
      You are DocWise AI, a specialized legal document analysis tool.
      Target Language: ${targetLanguage}.
      User Context: ${userType}.

      Core Objectives:
      - DECODE: Translate legal jargon into everyday language.
      - PROTECT: Highlight unfair, one-sided, or unusual terms.
      - FINANCIALS: List all fees, penalties, and renewal charges.
      - SCAM CHECK: Check for red flags indicating fraudulent documents.
      - DATES: Extract all critical deadlines and durations.
      
      ${isComparison ? 'You are comparing multiple documents. Provide an individual analysis for each AND a comprehensive comparison result.' : 'Analyze the provided document thoroughly.'}
    `;

    const promptParts: any[] = [{ text: instructions }];

    inputs.forEach((input, idx) => {
      if (isComparison) {
        promptParts.push({ text: `--- START OF DOCUMENT ${idx + 1} (${input.fileName}) ---` });
      }
      
      if (input.type === 'file') {
        promptParts.push({
          inlineData: {
            mimeType: input.mimeType!,
            data: input.data
          }
        });
      } else {
        promptParts.push({ text: `Source (${input.type}): ${input.data}` });
      }

      if (isComparison) {
        promptParts.push({ text: `--- END OF DOCUMENT ${idx + 1} ---` });
      }
    });

    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: promptParts },
      config: {
        responseMimeType: "application/json",
        responseSchema: isComparison ? comparisonSchema : analysisSchema,
        tools: inputs.some(i => i.type === 'url') ? [{ googleSearch: {} }] : undefined,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis generated.");
    
    const parsed = JSON.parse(text);
    
    if (isComparison) {
      if (!parsed.docs || !Array.isArray(parsed.docs)) {
        throw new Error("AI response error: Comparison results were missing.");
      }
      // Ensure each doc has its original filename attached for the UI
      parsed.docs = parsed.docs.map((doc: any, i: number) => ({
        ...doc,
        fileName: inputs[i]?.fileName || `Document ${i + 1}`
      }));
      return { comparison: parsed };
    } else {
      return { 
        analysis: {
          ...parsed,
          fileName: inputs[0]?.fileName || 'Pasted Content'
        } 
      };
    }
  } catch (error) {
    console.error("Gemini service error:", error);
    throw new Error(error instanceof Error ? error.message : "Document analysis failed.");
  }
};
