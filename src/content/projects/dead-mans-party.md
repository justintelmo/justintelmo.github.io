---
title: "Dead Man's Party: A Knives Out Game"
studio: The Game Band
platforms: [Netflix TV, iOS, Android]
role: Senior Back-End & Full-Stack Engineer
summary: "Built the Netflix SDK link that turns phones into controllers, plus Unity animation, audio, and UI work."
workedFrom: 2025-03
workedTo: 2026-02
launched: 2025
featured: true
order: 1
contributions:
  - Built the first Netflix SDK integration that turns a phone into a controller, paired to the TV with a QR code.
  - Cut load time from 10s to under 4s by restructuring asset bundles and loading localized content async.
  - Built the device communication backbone and a 12-language localization pipeline.
  - Wired the Netflix Haptics API so phone vibration stays in sync with TV gameplay.
stats: []
tech: [Unity, C#, Netflix SDK, Netflix Haptics API]
images:
  - src: ../../assets/projects/dead-mans-party/teaser.png
    alt: "Animated title art from Dead Man's Party: a silhouetted guest in a doorway behind the body of the victim"
    attribution: https://www.whats-on-netflix.com/news/netflix-games/netflix-releases-its-knives-out-tie-in-game-just-in-time-for-christmas/
links:
  - label: The Game Band
    url: https://thegameband.com/game/dead-mans-party
---
I was the first developer moved fully onto the project that became *Dead Man's Party*, a Knives Out party game for Netflix where players use their phones as controllers while the story plays on the TV. My first job was getting phones and TVs talking through the Netflix SDK. After that I moved into gameplay work in Unity, and I was part of the team that localized the game into 12 languages.

## Key features

### Phones as controllers

I built the first Netflix SDK integration that turns a phone into a controller, paired to the TV with a QR code. That grew into the device communication backbone the rest of the game sends its messages through.

**Tech:** Unity, C#, Netflix SDK

### Faster loading

Load time was around 10 seconds. I restructured the asset bundles and loaded localized content asynchronously, which brought it under 4 seconds.

**Tech:** Unity, C#

### Localization in 12 languages

I built the pipeline that brings translated text and audio into the game. I worked with audio engineers and QA to get both into all 12 languages.

**Tech:** Unity, C#

### Haptics in sync with the TV

I wired up the Netflix Haptics API so phone vibration stays in sync with what happens on the TV.

**Tech:** Netflix Haptics API, Unity

### Gameplay polish

I helped build player-facing features with Unity Timeline for animation, FMOD for audio, and the Animate UI Materials package for UI effects, and I helped tune gameplay.

**Tech:** Unity Timeline, FMOD, Animate UI Materials
