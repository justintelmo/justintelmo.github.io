---
title: Battle Pirates
studio: KIXEYE
platforms: [Facebook, Web]
role: Game & Backend Engineer
summary: "Combined ActionScript 3 and PHP to create features for a social-first strategy game."
workedFrom: 2016-05
workedTo: 2018-07
launched: 2011
featured: true
order: 5
stats: []
tech: [PHP, Laravel, Symfony, MySQL, Redis, Memcached, C++, Python, ActionScript 3, SonarQube, Stage3D]
images:
  - src: ../../assets/projects/battle-pirates/base.jpg
    alt: "Isometric view of a fortified island base with walls, turrets, and docked ships"
    attribution: https://files.armorgames.com/blog/2014/08/screenshot_images3_252.jpg
links:
  - label: Official site
    url: https://www.kixeye.com/battlepirates
---
Battle Pirates is a naval-themed strategy game from KIXEYE. Most of the back end was PHP, with a live battle simulation server in C++, an ActionScript 3 client, and a small chat service in Python. Most of my work surfaced as game features, from small refactors to tentpole work like new content updates and game modes.

## Key features

### Server-authoritative game logic

I helped secure previously client-authoritative features behind **PHP** server-authoritative logic. This meant creating server-side validation for anything that was purchased via the **ActionScript 3** client using in-game currency. Part of this was also helping create a flexible system that would support new types of currency, using the server as the source of truth. This resulted in a significant decrease in the amount of content players were able to claim through exploits.

### Content updates and tentpole features

I was responsible for assisting our content team by maintaining and creating internal tools that would make their jobs easier. I would regularly assist with engineering efforts for large content updates, such as level cap increases and new gameplay mode releases. 

### Code quality and QoL upgrades

I helped integrate **SonarQube** static analysis tools into our codebase to assist in helping standardize our coding best practices. This allowed for code reviews to be focused more on following logic than style. 