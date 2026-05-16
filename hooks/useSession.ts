import { useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { PracticeMode } from '@/types';

export function useSession() {
  const { user } = useAuthStore();

  const uploadAudio = useCallback(async (localUri: string): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    const fileName = `${user.id}/${Date.now()}.m4a`;
    const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
    const { error } = await supabase.storage.from('audio-recordings').upload(fileName, decode(base64), { contentType: 'audio/m4a', upsert: false });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const { data: signedData, error: signedError } = await supabase.storage.from('audio-recordings').createSignedUrl(fileName, 3600);
    if (signedError || !signedData) throw new Error('Could not generate audio URL');
    return signedData.signedUrl;
  }, [user]);

  const createSession = useCallback(async (mode: PracticeMode, durationSeconds: number, audioUrl: string): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase.from('sessions').insert({ user_id: user.id, mode, duration_seconds: durationSeconds, audio_url: audioUrl }).select('id').single();
    if (error || !data) throw new Error(`Session creation failed: ${error?.message}`);
    return data.id;
  }, [user]);

  const analyzeSession = useCallback(async (sessionId: string, audioUrl: string): Promise<number> => {
    const { data, error } = await supabase.functions.invoke('analyze-session', { body: { session_id: sessionId, audio_url: audioUrl } });
    if (error) throw new Error(`Analysis failed: ${error.message}`);
    return data.overall_score as number;
  }, []);

  return { uploadAudio, createSession, analyzeSession };
}
