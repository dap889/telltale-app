# Telltale — Setup Checklist

Use this as your step-by-step launch guide.

## ✅ Phase 1 — Local Setup
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env` and fill in keys
- [ ] Run `npx expo start` and confirm app loads on Expo Go

## ✅ Phase 2 — Supabase
- [ ] Create project at supabase.com
- [ ] Run `supabase/schema.sql` in SQL editor
- [ ] Create private bucket: `audio-recordings`
- [ ] Deploy edge function: `supabase functions deploy analyze-session`
- [ ] Set secret: `supabase secrets set OPENAI_API_KEY=sk-...`
- [ ] Test: record a session and confirm results appear

## ✅ Phase 3 — RevenueCat
- [ ] Create account at revenuecat.com
- [ ] Add iOS app + Android app
- [ ] Create entitlement: `pro`
- [ ] Create offering with monthly + annual packages
- [ ] Add API keys to `.env`
- [ ] Test purchase flow with sandbox accounts

## ✅ Phase 4 — Pre-launch
- [ ] Add real app icon (1024x1024 PNG) to `assets/images/icon.png`
- [ ] Add splash screen to `assets/images/splash.png`
- [ ] Update `eas.json` with your Apple ID, team ID, ASC App ID
- [ ] Run `eas build:configure`

## ✅ Phase 5 — iOS Release
- [ ] `eas build --platform ios --profile production`
- [ ] `eas submit --platform ios`
- [ ] Fill out App Store listing in App Store Connect
- [ ] Submit for review

## ✅ Phase 6 — Android Release
- [ ] Create app in Google Play Console
- [ ] `eas build --platform android --profile production`
- [ ] `eas submit --platform android`
- [ ] Fill out Play Store listing
- [ ] Submit for review
