export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface MapGroundingChunk {
  maps: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        snippet: string;
        author: string;
      }[];
    };
  };
}

export interface SearchGroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export type GroundingChunk = MapGroundingChunk | SearchGroundingChunk;

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  groundingChunks?: GroundingChunk[];
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}