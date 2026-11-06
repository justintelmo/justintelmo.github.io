---
title: StoryLoom
studio: Pixelberry Studios
platforms: [iOS, Android]
role: Full-Stack Engineer II
summary: "Helped take StoryLoom to a global launch with a lighter React client and Node.js services on AWS."
workedFrom: 2023-04
workedTo: 2024-03
launched: 2023
featured: true
order: 3
stats: []
tech: [TypeScript, React, Vite, Node.js, AWS, Docker, Unity]
images:
  - src: ../../assets/games/storyloom/logo.png
    alt: "StoryLoom logo in white block letters on a red background"
    attribution: https://bio.site/GetStoryLoom
links:
  - label: Launch announcement
    url: https://www.businesswire.com/news/home/20231004480152/en/Pixelberry-Studios-Launches-StoryLoom-Out-of-Beta-to-Give-Interactive-Content-Creators-Publishing-Freedom
---
StoryLoom is a mobile app from Pixelberry Studios for interactive stories. The storefront was a TypeScript web app that talked to a core game layer written in Unity C#. I joined as a full-stack engineer and helped take it out of beta to a global launch on iOS and Android. It was my first time working in modern TypeScript, alongside a team of strong web engineers.

## Key features


### A platform for storytellers

StoryLoom was a platform for storytellers to be able to create and eventually sell their stories and characters to readers. The core of StoryLoom was centered around tools that would help users create their own content, as well as the actual gameplay engine written in **Unity**. The majority of my work was done on the storefront side, which allowed users to browse stories, make in-app purchases, and launch stories into the game engine. This platform was initially designed with only web clients in mind, but was later extended to support native mobile clients for both **iOS** and **Android**.

### A lighter mobile client

I helped build the mobile-friendly client in **Vite** and **React** via **TypeScript**. This resulted in a >50% decrease in app size.

### Node.js services

I built **Node.js** microservices supported by **AWS** and **Docker** that served thousands of daily players. I often wrote the client feature and the server code behind it.

### Bridge between web and Unity

I maintained the **JSBridge** layer that let the web client and the native **Unity** clients talk to each other. This was important for storing which stories a user has seen, stories that a user has purchased, and what decisions had been made in a previous part of a given story.


