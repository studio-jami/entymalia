# BrandForge Production Roadmap

## Executive Overview
BrandForge is an enterprise-grade corporate brand identity and multi-platform media asset builder. Powered by Gemini and Veo engines, it allows enterprises to orchestrate, generate, and audit design consistency offline-first. This roadmap maps out the production timeline for all upcoming capabilities.

## Strategic Pillars & Feature Milestones

### 1. Vector Identity Engine
- **SVG Code Real-time Editor**: Enable raw SVG node editing and previewing directly in the UI with instant canvas redraws.
- **AI Typography Pairings**: Incorporate dynamic Google Fonts integrations to recommend matching display headings based on corporate description.
- **Export Assets Packager**: Support exporting SVG assets as high-resolution PDF, SVG, and high-fidelity PNG (300 DPI print-ready).

### 2. Multi-Channel Visual Asset Pipeline
- **Smart Product Mockups**: Overlay generated logos onto mock product packaging (boxes, bags, bottles, shirts) with automatic perspective mapping.
- **Social Banner Orchestrator**: Generate ready-to-publish banner templates for LinkedIn headers, Facebook covers, and X banner shapes simultaneously matching the brand profile.

### 3. Veo Cinematic Media Suite
- **Storyboard Director**: Write structured narratives to render sequential multi-shot video promo commercials.
- **Brand Audio Integration**: Generate background atmospheric cinematic audio overlaying video renders using music generators.

### 4. Advanced Brand Audit Center
- **Automated Color Contrast checks**: Verify contrast ratios (WCAG 2.1 compliance) for all generated web components.
- **Asset Telemetry & Sync**: Enable multi-user profile synchronization with secure cloud database mirroring (Firebase / Spanner).

---

## Completed Capabilities

### 1. Interactive Corporate Color Studio
- **Guided HSV & Spectrum Selection**: Fully integrated a rich, bidirectional Hue-Saturation-Value color-picker with real-time reactive canvas gradients representing saturation and brightness contributors.
- **Side-by-Side Comparison**: Implemented original vs. new selected color preview blocks, including programmatic light/dark contrast luminance checking.
- **M3 Corporate Presets Grid**: Added a curated grid of 24 designer-grade corporate and digital presets for ultra-fast, consistent style selections.

### 2. Global Style & Concept Reference Studio
- **Persistent Reference Assets**: Integrated reference uploads directly into our offline-first Room database (using `generated_assets` schema). Users can upload inspiration photos, product designs, character reference sheets, or layout structures and persist them securely under each brand kit.
- **Multimodal Gemini & Veo Integration**: Upgraded the generative models (`gemini-3.1-pro-preview`, `gemini-3-pro-image-preview`, and `veo-3.1-fast-generate-preview`) to dynamically inject visual reference assets into prompt blocks, ensuring consistent multi-modal guidance across SVG, Image, and Video.
- **Unified Reusable ReferenceSelector**: Developed a masterclass Jetpack Compose component that lists saved brand references, offers direct deletions, and enables quick visual uploads with custom names and category classes (Style Reference, Character Reference, Layout Reference, Product Photo).

