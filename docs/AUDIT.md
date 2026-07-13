# Project Audit: Etymalia

**Date**: July 2026
**Target SDK**: 36
**Min SDK**: 24

## Architecture Overview
Etymalia is an Android application built natively using Jetpack Compose and Kotlin. It follows the standard modern Android architecture recommended by Google:
- **UI Layer**: Jetpack Compose (`BrandNavigation`, `BrandListScreen`, `BrandDetailScreen`, `AddBrandScreen`).
- **State Management**: `ViewModel` (`BrandViewModel`) managing state via `StateFlow` and Coroutines.
- **Data Layer**: 
  - **Local Persistence**: Room Database (`BrandDatabase`, `BrandDao`) to store user-created brand profiles and generated assets.
  - **Network / API**: Retrofit for interacting with Gemini APIs (using models like `gemini-3.1-pro-preview`, `gemini-3-pro-image-preview`, `veo-3.1-fast-generate-preview`).

## Current Features
1. **Brand Profiles**: Create and manage local brand profiles (name, industry, description).
2. **AI Asset Generation**:
   - SVG Logos
   - Marketing Images
   - Branding Icons Bundle (Favicons, Social Avatars)
   - Video Promos (Veo 3.1)
   - Brand Color Palettes
3. **Gallery**: Local storage and retrieval of generated assets using Room.
4. **Brand Audit**: AI-driven evaluation of brand consistency based on uploaded imagery.

## Technical Debt & Areas for Improvement
- **Leftover key guard**: `BrandViewModel.generateBrandColorPalette()` still references `BuildConfig.GEMINI_API_KEY`. AI already routes through the Supabase `gemini-proxy` Edge Function — the guard should be **removed**, not extended.
- **Hardcoded Strings**: UI components have hardcoded text; should be moved to `strings.xml` for localization.
- **Error Handling**: Basic error surfacing in the ViewModel. Could benefit from a unified `UiState`/`UiEvent` (MVI-style) wrapper.
- **Dependency Injection**: Manual DI (`BrandViewModelFactory`) is a **deliberate choice** (see `AGENTS.md`) — Hilt/Dagger were removed as incompatible with AGP 9 and unnecessary at this size. Do **not** reintroduce them unless the app splits into multiple modules.

## Dependencies Audit
- Compose BOM and Material 3 are up-to-date.
- **Backend is Supabase** (Auth + Postgres + Storage + Edge Functions). Firebase/`google-services` were fully removed — any Firebase reference in older notes is obsolete.
- AI calls go through the Supabase Edge Function `gemini-proxy`; the client never holds the Gemini key.
- Navigation Compose is set up nicely.
- Coil used for async image loading.
- KSP used for Room compilation.