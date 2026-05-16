import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

export type RecordingStatus = 'idle' | 'recording' | 'stopped' | 'uploading' | 'error';

interface UseAudioRecorderReturn {
  status: RecordingStatus;
  durationMs: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  error: string | null;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null); setDurationMs(0);
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) { setError('Microphone permission is required.'); setStatus('error'); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setStatus('recording');
      intervalRef.current = setInterval(() => setDurationMs((p) => p + 100), 100);
    } catch (err) {
      setError('Could not start recording. Please try again.');
      setStatus('error');
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      if (!recordingRef.current) return null;
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setStatus('stopped');
      return uri ?? null;
    } catch {
      setError('Could not stop recording.');
      setStatus('error');
      return null;
    }
  }, []);

  return { status, durationMs, startRecording, stopRecording, error };
}
