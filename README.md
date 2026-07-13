# Etymalia

Etymalia is an AI-powered brand identity platform. The **Android app** (native Kotlin + Jetpack Compose + Google Gemini/Veo) generates logos, marketing assets, color palettes, and video promos. A **web platform** (Next.js + Supabase on Vercel, in active development at `etymalia.jami.studio`) is expanding this into a full brand generator, featuring the **Etymaria** etymology-driven name engine.

Backend is **Supabase**; AI calls are proxied server-side (never from the client).

## Prerequisites

- [Android Studio](https://developer.android.com/studio) (July 2026 or later recommended)
- A valid Gemini API Key.

## Run Locally

1. Open Android Studio.
2. Select **Open** and choose the directory containing this project (`brand-design`).
3. Allow Android Studio to complete Gradle sync.
4. Create a file named `.env` in the root of the project directory. Add your API key:
   ```env
   GEMINI_API_KEY=YOUR_API_KEY_HERE
   ```
5. Click the green **Run** button (Play icon) in the Android Studio toolbar to deploy the app to an emulator or physical device.

## Documentation

Comprehensive guides are available in the `docs/` folder:

- **[Project Audit](./docs/AUDIT.md)**: Current state and technical architecture.
- **[App Signing & Local Installation](./docs/APP_SIGNING.md)**: How to export the app without a developer account.
- **[Web Platform](./docs/WEB_APP.md)**: The Next.js + Supabase web app (`etymalia.jami.studio`).
- **[Web Platform Master Plan](./docs/research/webapp_master_plan.md)**: Full architecture, tooling, and phasing for the brand generator.
- **[Roadmap](./docs/roadmap.md)**: Planned features and improvements.
- **[IDE Guide](./docs/IDE_GUIDE.md)**: Android Studio vs VS Code workflows.
- **[Performance & Defender Exclusions](./docs/DEFENDER_EXCLUSIONS.md)**: Speeding up build times on Windows.

## Marketing Page
A static web landing page stub has been placed in `marketing-page/`. It is optimized for Vercel deployment.