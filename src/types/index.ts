export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export type ContentType = 'sfw' | 'nsfw';
export type MediaType = 'photo' | 'video';

export interface MediaItem {
  id: string;
  userId: string;
  type: MediaType;
  contentType: ContentType;
  url: string;
  thumbnail?: string;
  prompt?: string;
  parameters?: GenerationParameters;
  createdAt: string;
  isFinalized: boolean;
}

export interface GenerationParameters {
  model?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance_scale?: number;
  num_images?: number;
  seed?: number;
  image_url?: string;
  strength?: number;
}

export interface GenerationResult {
  id: string;
  images: string[];
  prompt: string;
  parameters: GenerationParameters;
  createdAt: string;
}

export interface FalImageResponse {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
  seed?: number;
  has_nsfw_concepts?: boolean[];
  prompt?: string;
}

// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      media: {
        Row: {
          id: string;
          user_id: string;
          type: 'photo' | 'video';
          content_type: 'sfw' | 'nsfw';
          url: string;
          thumbnail: string | null;
          prompt: string | null;
          parameters: any | null;
          is_finalized: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: 'photo' | 'video';
          content_type: 'sfw' | 'nsfw';
          url: string;
          thumbnail?: string | null;
          prompt?: string | null;
          parameters?: any | null;
          is_finalized?: boolean;
        };
        Update: {
          type?: 'photo' | 'video';
          content_type?: 'sfw' | 'nsfw';
          url?: string;
          thumbnail?: string | null;
          prompt?: string | null;
          parameters?: any | null;
          is_finalized?: boolean;
        };
      };
    };
  };
}
