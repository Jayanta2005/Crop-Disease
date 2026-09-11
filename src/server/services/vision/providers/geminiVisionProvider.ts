import { GoogleGenAI } from '@google/genai';
import { config } from '../../../config';
import { IVisionModelProvider, RawVisionDiagnosis, VisionPredictionParams } from '../types';

export class GeminiVisionProvider implements IVisionModelProvider {
  public readonly name = 'gemini-vision';
  private client: GoogleGenAI | null = null;

  constructor() {
    this.initClient();
  }

  private initClient(): void {
    if (config.gemini.apiKey) {
      try {
        this.client = new GoogleGenAI({
          apiKey: config.gemini.apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });
      } catch (err) {
        // Safe logging - never log api keys or tokens
        console.warn('[GeminiVisionProvider] Failed to initialize GoogleGenAI client:', err instanceof Error ? err.message : 'Unknown error');
        this.client = null;
      }
    }
  }

  public isAvailable(): boolean {
    if (!this.client && config.gemini.apiKey) {
      this.initClient();
    }
    return Boolean(this.client && config.gemini.apiKey);
  }

  public async analyzeLeafImage(params: VisionPredictionParams): Promise<RawVisionDiagnosis> {
    if (!this.isAvailable() || !this.client) {
      throw new Error('Gemini vision model is not configured or unavailable');
    }

    if (!params.rawBase64) {
      throw new Error('No valid image data provided for multimodal vision inference');
    }

    const mimeType = params.mimeType || 'image/jpeg';
    const cropName = params.cropName || params.cropId;
    const cropStage = params.cropStage || 'Vegetative';

    const prompt = `You are an authoritative agricultural plant pathologist specializing in South Asian and Indian crops.
Analyze this high-resolution leaf image for the crop "${cropName}" (Growth Stage: ${cropStage}).

Examine the image closely for:
1. Lesion colors (e.g. grayish center, brown margin, chlorotic yellow halo)
2. Lesion shape and distribution (spindle, circular spots, linear stripes, mosaic, wilting)
3. Fungal mycelium, bacterial streaming, or insect chewing/frass
4. Growth stage of the crop if identifiable

Return a JSON object conforming strictly to this schema:
{
  "primaryDiagnosis": "Exact scientific and common name of disease/pest, or 'Healthy Foliage'",
  "cropStage": "Detected or inferred growth stage",
  "diseaseOrPestType": "DISEASE" | "PEST" | "PHYSIOLOGICAL_DISORDER" | "NUTRIENT_DEFICIENCY" | "HEALTHY",
  "confidence": 0.85,
  "severity": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "affectedLeafAreaPercent": "8% - 15%",
  "visualSymptoms": [
    "Specific symptom 1 observed in this leaf photo",
    "Specific symptom 2 observed in this leaf photo"
  ],
  "alternativeDiagnoses": [
    { "name": "Differential diagnosis 1", "confidence": 0.12, "reasoning": "Why this is less likely" },
    { "name": "Differential diagnosis 2", "confidence": 0.03, "reasoning": "Why this is unlikely" }
  ],
  "whyAiThinksThis": {
    "lesionColor": "Specific lesion color breakdown",
    "lesionShape": "Specific shape geometry observed",
    "lesionPattern": "Spatial distribution across leaf surface",
    "affectedArea": "Estimated foliar leaf area affected",
    "summary": "Concise pathological diagnosis justification"
  },
  "visualObservations": [
    "Key observation 1",
    "Key observation 2"
  ],
  "recommendedNextScanHours": 24,
  "recommendation": "Concise non-chemical and chemical action advice",
  "requires_expert_review": false
}`;

    // 12-second timeout race to prevent hanging API requests
    const callPromise = this.client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType as any,
                data: params.rawBase64
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Gemini API call timed out after 12000ms'));
      }, 12000);
    });

    try {
      const response = await Promise.race([callPromise, timeoutPromise]);

      if (!response || !response.text) {
        throw new Error('Empty response received from Gemini vision model');
      }

      const text = response.text.trim();
      let cleanText = text;
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
      }

      return JSON.parse(cleanText) as RawVisionDiagnosis;
    } catch (err: any) {
      // Classify and safely log errors without leaking sensitive data
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota')) {
        console.warn('[GeminiVisionProvider] Quota/rate limit exceeded (429/ResourceExhausted).');
      } else if (errorMessage.includes('timed out')) {
        console.warn('[GeminiVisionProvider] Vision request timed out after 12000ms.');
      } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
        console.warn('[GeminiVisionProvider] Network connectivity error to Google GenAI endpoint.');
      } else {
        console.warn('[GeminiVisionProvider] Model inference error:', errorMessage);
      }

      throw err;
    }
  }
}

export const geminiVisionProvider = new GeminiVisionProvider();
