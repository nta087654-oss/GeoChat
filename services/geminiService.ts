import { GoogleGenAI, Tool } from "@google/genai";
import { Message, Role, Coordinates, GroundingChunk } from "../types";

// Initialize the Gemini API client
// Note: Using gemini-2.5-flash as it is optimized for tool usage (Search & Maps)
// and provides faster responses for interactive chat.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  userLocation?: Coordinates
): Promise<{ text: string; groundingChunks?: GroundingChunk[] }> => {
  
  try {
    // Configure tools
    const tools: Tool[] = [
      { googleSearch: {} },
      { googleMaps: {} }
    ];

    // Configure tool config (location)
    const toolConfig = userLocation
      ? {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
          },
        }
      : undefined;

    // Transform history for the API
    // We filter out messages that might be purely UI state if we had any,
    // but here we just map our Message type to the API content format.
    // We only send the last few turns to keep context relevant and cheap, 
    // but for this demo we send all valid text turns.
    const contents = history.map((msg) => ({
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Add the new user message
    contents.push({
      role: 'user',
      parts: [{ text: newMessage }],
    });

    // We use 'gemini-2.5-flash' specifically for its robust grounding tool support
    const modelName = 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        tools: tools,
        toolConfig: toolConfig,
        systemInstruction: `You are GeoChat, a helpful and friendly AI assistant. 
        You specialize in helping users find places, understand local geography, and get real-time information.
        ALWAYS use the available tools (Google Maps and Google Search) to provide accurate, up-to-date answers.
        If a user asks about "nearby" places, rely on the provided location data.
        Format your response clearly.`,
      },
    });

    const text = response.text || "I found some information but couldn't generate a text summary.";
    
    // Extract grounding chunks (Map or Search citations)
    const candidates = response.candidates;
    let groundingChunks: GroundingChunk[] = [];
    
    if (candidates && candidates[0]?.groundingMetadata?.groundingChunks) {
      groundingChunks = candidates[0].groundingMetadata.groundingChunks as GroundingChunk[];
    }

    return {
      text,
      groundingChunks,
    };
  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw error;
  }
};