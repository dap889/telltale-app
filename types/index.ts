export type SubscriptionTier = 'free' | 'pro';
export type PracticeMode = 'interview' | 'presentation' | 'casual' | 'custom';
export type FeedbackCategory = 'filler_words' | 'pacing' | 'tone' | 'confidence' | 'clarity';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  mode: PracticeMode;
  duration_seconds: number;
  audio_url: string | null;
  transcript: string | null;
  overall_score: number | null;
  created_at: string;
}

export interface SessionFeedback {
  id: string;
  session_id: string;
  category: FeedbackCategory;
  score: number;
  details: {
    summary: string;
    examples?: string[];
    suggestions: string[];
    count?: number;
  };
  created_at: string;
}

export interface SessionWithFeedback extends Session {
  feedback: SessionFeedback[];
}
