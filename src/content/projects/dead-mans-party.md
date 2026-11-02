---
title: "Dead Man's Party: A Knives Out Game"
studio: The Game Band
platforms: [Netflix TV, iOS, Android]
role: Senior Back-End & Full-Stack Engineer
summary: "Built the Netflix SDK link that turns phones into controllers, plus performance optimization, audio, and UI work."
workedFrom: 2025-03
workedTo: 2026-02
launched: 2025
featured: true
order: 1
stats: []
tech: [Unity, C#, Netflix SDK, Netflix Haptics API, FMOD]
images:
  - src: ../../assets/projects/dead-mans-party/teaser.png
    alt: "Animated title art from Dead Man's Party: a silhouetted guest in a doorway behind the body of the victim"
    attribution: https://www.whats-on-netflix.com/news/netflix-games/netflix-releases-its-knives-out-tie-in-game-just-in-time-for-christmas/
links:
  - label: The Game Band
    url: https://thegameband.com/game/dead-mans-party
---
I was the first developer moved fully onto the project that became *Dead Man's Party: A Knives Out Game*, a party game for Netflix where players use their phones as controllers while the story plays on the TV. My first job was getting phones and TVs talking through the Netflix SDK. After that I moved into gameplay work in Unity, and I was part of the team that localized the game into 12 languages.

## Key features

### Phones as controllers

I integrated the **Netflix SDK** into our game's Unity project, building a proof of concept around its event messaging system. This proved our game was a viable project and helped us receive a greenlight from Netflix. Players pair their mobile device to a large-screen device via QR code, and the phone becomes a controller.

### Multi-platform build targets

The game shipped from one Unity project that contained two separate build targets: a Linux build for large screen devices 

### Faster loading

One of Netflix's requirements for our game was to meet a strict time-to-interaction metric. I coordinated with Netflix engineers as well as fellow engineers on this project to bring our time-to-interaction to below 4 seconds, down from an initial 10 seconds. This involved implementing background asset loading, and optimizing our asset bundling code to package fewer bundles for the controller build target.

### Localized audio for 12 languages 

On this project, I leveraged **FMOD** with coordination from an audio engineer to implement sounds and music into the game. We coordinated with multiple voice actors to have voice lines recorded in twelve different languages, and I was tasked with implementing the system that properly loaded the necessary audio per language and played sound effects and music throughout the game. 

### Event-driven haptics

One of the major features of this project was implementing haptic feedback for our mobile builds. We leveraged the **Netflix Haptics API**, part of the **Netflix SDK**, to have specific haptics events fire with coordination from the TV build, adding a level of immersion to the experience designed to keep players more engaged. 

### Murder-mystery gameplay features

I helped implement some of the core gameplay features of this game, including the system that determines game phase, the voting system, and parts of the menu system. On top of this, I also implemented many of the mobile gameplay screens to designer spec, and ensured the gameplay flow for all players met designer criteria. 
