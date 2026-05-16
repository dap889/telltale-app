# 🎙️ Telltale

**AI-powered speech coaching app** — Record yourself, get instant feedback on filler words, pacing, tone, and confidence. Built with React Native + Expo.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | React Native + Expo (SDK 52) |
| Language | TypeScript |
| Navigation | Expo Router (file-based) |
| Styling | NativeWind (Tailwind) |
| Backend/DB | Supabase |
| Audio | expo-av |
| AI Transcription | OpenAI Whisper |
| AI Analysis | OpenAI GPT-4o |
| Payments | RevenueCat |
| State | Zustand |

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/dap889/telltale-app.git
cd telltale-app
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Fill in your keys:
- `EXPO_PUBLIC_SUPABASE_URL` — from your Supabase project settings
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project settings
- `EXPO_PUBLIC_RC_API_KEY_IOS` — from RevenueCat dashboard
- `EXPO_PUBLIC_RC_API_KEY_ANDROID` — from RevenueCat dashboard

### 3. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor
3. Create a storage bucket called `audio-recordings` (set to **private**)
4. Deploy the edge function:
```bash
supabase functions deploy analyze-session
supabase secrets set OPENAI_API_KEY=sk-...
```

### 4. Run the app
```bash
npx expo start
```
Scan the QR code with [Expo Go](https://expo.dev/client) on your phone.

---

## Project Structure

```
telltale/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Onboarding, Login, Signup
│   ├── (tabs)/             # Home, Practice, History, Progress, Settings
│   └── session/            # Record, Processing, Results
├── components/             # Reusable UI components
├── constants/              # Colors, typography, config
├── hooks/                  # useAudioRecorder, useSession, useSubscription
├── lib/                    # Supabase, RevenueCat, freeTierGuard
├── store/                  # Zustand: authStore, sessionStore
├── supabase/
│   ├── schema.sql          # Full DB schema with RLS
│   └── functions/          # Edge function: analyze-session
└── types/                  # Shared TypeScript types
```

---

## Monetization

- **Free tier**: 3 sessions/month
- **Pro**: Unlimited sessions via RevenueCat (monthly + annual plans)
- Paywall screen with feature list and package selection

---

## Deployment

### iOS (TestFlight)
```bash
eas build --platform ios --profile preview
eas submit --platform ios
```

### Android (Play Store)
```bash
eas build --platform android --profile production
eas submit --platform android
```

---

## Roadmap

- [x] Phase 1 — Auth, navigation, database, AI edge function
- [x] Phase 2 — Recording engine, upload pipeline, results screen
- [x] Phase 3 — History, progress chart, settings
- [x] Phase 4 — Paywall, onboarding, free tier guard, deployment config
- [ ] Session replay with transcript highlighting
- [ ] Custom practice goals
- [ ] Social sharing of progress
- [ ] Apple Watch companion

---

## License

MIT
