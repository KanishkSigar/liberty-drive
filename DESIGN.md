---
name: Liberty City Chronicles 3D
description: GTA III-inspired 3D action driving game design system
colors:
  primary: "#f0c540"
  secondary: "#ff2a8d"
  tertiary: "#00d2ff"
  emerald: "#22e066"
  danger: "#d33333"
  neutral-bg: "#040407"
  panel-bg: "rgba(14, 18, 28, 0.85)"
  panel-border: "rgba(240, 197, 64, 0.15)"
typography:
  display:
    fontFamily: "'Orbitron', monospace"
    fontWeight: 900
    letterSpacing: "5px"
  body:
    fontFamily: "'Outfit', sans-serif"
    fontWeight: 400
rounded:
  sm: "4px"
  btn: "6px"
  md: "10px"
  lg: "12px"
  pill: "22px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#000000"
    rounded: "{rounded.sm}"
    padding: "15px 40px"
  button-primary-hover:
    backgroundColor: "#ffe066"
  stat-box:
    backgroundColor: "{colors.panel-bg}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
---

# Design System: Liberty City Chronicles 3D

## Overview

**Creative North Star: "Arcade Neon Underground"**

Liberty City Chronicles 3D channels the dark, high-adrenaline atmosphere of early 2000s retro 3D action driving titles. The visual interface recedes into high-contrast glassmorphic HUD overlays, allowing the immersive 3D cityscape to lead while providing immediate, high-density tactical feedback for speed, mission countdown timers, gear state, armor condition, and crime wanted heat.

The aesthetic philosophy pairs deep asphalt dark backdrops (`#040407`) with vibrant, glowing neon accents: classic GTA gold (`#f0c540`), Vice magenta (`#ff2a8d`), cyan nitrous purge plumes (`#00d2ff`), and emerald garage green (`#22e066`). 

**Key Characteristics:**
- **Translucent Glassmorphism:** Backdrop blur filters (`blur(12px)`), subtle golden glass borders, and elevated HUD stat containers.
- **High-Readability Typography:** Monospaced futuristic Orbitron display headers paired with clean Outfit body sans-serif.
- **Tactile State Feedback:** Glowing RPM redline flashes, energetic button hover lifts, and dynamic wanted level star badges.

## Colors

The color palette relies on high-contrast neon accents emerging from dark, low-reflectance glass panels.

### Primary
- **Classic Liberty Gold** (`#f0c540`): Primary accent for call-to-action buttons, active HUD timers, checkpoint rings, and default HUD themes.

### Secondary
- **Vice Neon Magenta** (`#ff2a8d`): Secondary accent for Vice City HUD color themes, speed redline alerts, and high-heat indicators.

### Tertiary
- **Cyan Purge Accent** (`#00d2ff`): Accent color for nitrous oxide purge vapor plumes, high-speed speed lines, and Stinger Coupe underglow.

### Neutral
- **Asphalt Void Black** (`#040407`): Deep background canvas color behind the 3D viewport canvas.
- **Glass Panel Surface** (`rgba(14, 18, 28, 0.85)`): Translucent panel fill for stat boxes, overlays, and modal dialogs.
- **Muted Steel Gray** (`#8a8a8a`): Labels, inactive controls, unit indicators (`MPH`, `sec`), and helper copy.

### Named Rules
**The Rarity of Neon Rule.** Neon accent glows are reserved exclusively for active gameplay state (wanted stars, nitro boost, speed, target markers). Stat panel fills remain dark and unobtrusive.

## Typography

**Display Font:** Orbitron (with monospace fallback)  
**Body Font:** Outfit (with sans-serif fallback)  

**Character:** Industrial, futuristic, and authoritative. High letter-spacing on uppercase display headers evokes early-2000s arcade HUD telemetry.

### Hierarchy
- **Display** (Weight: 900, Size: 40px, Letter Spacing: 5px): Modal titles, mission victory/busted headers.
- **Headline** (Weight: 800, Size: 26px, Letter Spacing: 1px): Speedometer values, countdown timer numbers, clock display.
- **Title** (Weight: 700, Size: 16px, Letter Spacing: 2px): Vehicle names, mission titles, rebind prompt titles.
- **Body** (Weight: 400, Size: 12px-14px, Line Height: 1.4): Controls instructions, vehicle descriptions, mission descriptions.
- **Label** (Weight: 600, Size: 10.5px, Letter Spacing: 3px, Case: Uppercase): HUD stat box headers (`SPEED`, `TIME`, `GEAR`, `MISSION`).

## Layout

The UI utilizes a boundary-anchored HUD spatial model designed to preserve maximum viewport visibility for the 3D WebGL game canvas.

- **Top Left**: Active mission objective card with left gold border accent.
- **Top Right**: Floating horizontal row of glassmorphic stat boxes (`SPEED`, `GEAR`, `TIME`).
- **Bottom Left**: Circular minimap radar with golden/magenta outer ring border.
- **Bottom Right**: Keyboard controls hint panel and HUD Settings trigger button.
- **Center Modal View**: Centered overlay panels (`max-width: 500px`) with gradient dark fills and heavy drop shadows (`0 24px 64px rgba(0,0,0,0.92)`).

## Elevation & Depth

Depth is established through translucent glass layering and directional drop shadows rather than heavy skeuomorphic bevels.

### Shadow Vocabulary
- **Gold Ambient Glow** (`box-shadow: 0 0 15px rgba(240, 197, 64, 0.35)`): Applied to active HUD buttons, selected vehicle names, and radar borders.
- **Red Alert Glow** (`box-shadow: 0 0 15px rgba(221, 51, 51, 0.4)`): Applied to high wanted star badges, low armor warning bars, and mission failure banners.
- **Modal Panel Shadow** (`box-shadow: 0 24px 64px rgba(0,0,0,0.92)`): Provides separation between menu dialogs and the underlying blurred 3D scene.

### Named Rules
**The Tonal Glass Rule.** Glass containers use `backdrop-filter: blur(12px)` and 1px translucent borders (`rgba(240,197,64,0.15)`) to maintain contrast over shifting 3D scenery without solid opaque fills.

## Shapes

- **HUD Containers**: Rounded corners (`border-radius: 10px`) with 1px glass border strokes.
- **Action Buttons**: Slightly rounded (`border-radius: 6px`) with high-contrast filled backgrounds.
- **Minimap Radar**: Perfect circular mask (`border-radius: 50%`) with 3px solid theme border.
- **Toast Alerts**: Pill-shaped capsules (`border-radius: 22px`).

## Components

### Main Action Buttons
- **Shape:** Slightly rounded corners (`6px`).
- **Primary:** Bright gold fill (`#f0c540`) with solid black text (`#000000`), uppercase Orbitron typography, 15px 40px padding.
- **Hover:** Lifts `translateY(-2px)` with bright yellow highlight (`#ffe066`).

### Stat Boxes
- **Shape:** Rounded rectangle (`10px`).
- **Surface:** Translucent glass (`rgba(14, 18, 28, 0.85)`), `12px` backdrop blur.
- **Content:** Right-aligned uppercase muted label on top, bold white display value below.

### Keybinding Badges
- **Shape:** Rounded rectangle (`4px`).
- **Surface:** Dark background (`#1a1a20`), 1px solid border (`#3a3a40`), gold Orbitron text (`#f0c540`).

### Minimap Radar
- **Shape:** 172px circular frame with 3px solid theme border.
- **Internal**: Dark semi-transparent canvas (`rgba(0,0,0,0.7)`) rendering dynamic player icon, police blips, package checkpoints, and Pay 'n' Spray garages.

## Do's and Don'ts

### Do:
- **Do** use `Orbitron` font for all uppercase labels, values, and titles to maintain arcade telemetry character.
- **Do** apply `backdrop-filter: blur(12px)` to floating HUD containers to preserve visibility over bright 3D lighting.
- **Do** keep stat labels uppercase with generous letter-spacing (`3px`).

### Don't:
- **Don't** use solid opaque backgrounds for floating HUD elements; keep HUD containers translucent.
- **Don't** mix non-themed colors into the primary UI; strictly follow the active theme (Gold, Vice Pink, or Emerald).
- **Don't** obscure the central viewport with static UI elements during gameplay.
