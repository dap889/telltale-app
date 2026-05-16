import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY')! });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { session_id, audio_url } = await req.json();
    if (!session_id || !audio_url) {
      return new Response(JSON.stringify({ error: 'session_id and audio_url are required' }), { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // 1. Download audio
    const audioResponse = await fetch(audio_url);
    const audioBlob = await audioResponse.blob();
    const audioFile = new File([audioBlob], 'recording.m4a', { type: 'audio/m4a' });

    // 2. Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({ file: audioFile, model: 'whisper-1', language: 'en' });
    const transcript = transcription.text;

    // 3. Analyze with GPT-4o
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an expert speech coach. Analyze the provided transcript and return JSON:
{
  "overall_score": <0-100>,
  "feedback": [
    { "category": "filler_words", "score": <0-100>, "details": { "summary": "<string>", "examples": ["<string>"], "suggestions": ["<string>"], "count": <number> } },
    { "category": "pacing", "score": <0-100>, "details": { "summary": "<string>", "suggestions": ["<string>"] } },
    { "category": "confidence", "score": <0-100>, "details": { "summary": "<string>", "examples": ["<string>"], "suggestions": ["<string>"] } },
    { "category": "clarity", "score": <0-100>, "details": { "summary": "<string>", "suggestions": ["<string>"] } }
  ]
}
Filler words: um, uh, like, you know, so, basically, literally, actually, right, I mean.
Weak language: "I think maybe", "sort of", "kind of", "I'm not sure but".
Be specific and reference actual phrases from the transcript.`
        },
        { role: 'user', content: `Analyze this transcript:\n\n"${transcript}"` }
      ],
    });

    const analysis = JSON.parse(analysisResponse.choices[0].message.content ?? '{}');

    // 4. Update session
    await supabase.from('sessions').update({ transcript, overall_score: analysis.overall_score }).eq('id', session_id);

    // 5. Insert feedback
    await supabase.from('session_feedback').insert(
      analysis.feedback.map((f: any) => ({ session_id, category: f.category, score: f.score, details: f.details }))
    );

    return new Response(JSON.stringify({ success: true, overall_score: analysis.overall_score }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('analyze-session error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: corsHeaders });
  }
});
