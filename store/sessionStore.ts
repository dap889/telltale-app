import { create } from 'zustand';
import { Session, SessionWithFeedback } from '@/types';
import { supabase } from '@/lib/supabase';

interface SessionState {
  sessions: Session[];
  currentSession: SessionWithFeedback | null;
  isLoading: boolean;
  error: string | null;
  fetchSessions: (userId: string) => Promise<void>;
  fetchSessionById: (id: string) => Promise<void>;
  setCurrentSession: (session: SessionWithFeedback | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [], currentSession: null, isLoading: false, error: null,
  fetchSessions: async (userId) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.from('sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) set({ error: error.message, isLoading: false });
    else set({ sessions: data as Session[], isLoading: false });
  },
  fetchSessionById: async (id) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.from('sessions').select('*, session_feedback(*)').eq('id', id).single();
    if (error) set({ error: error.message, isLoading: false });
    else set({ currentSession: { ...data, feedback: data.session_feedback } as SessionWithFeedback, isLoading: false });
  },
  setCurrentSession: (session) => set({ currentSession: session }),
}));
