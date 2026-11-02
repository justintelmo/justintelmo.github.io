---
title: Covet Fashion
studio: EA / Glu Mobile
platforms: [iOS, Android]
role: Server Software Engineer II
summary: "Modernized a legacy PHP back end while delivering revenue-driving features."
workedFrom: 2018-10
workedTo: 2022-11
launched: 2013
featured: true
order: 4
stats:
  - value: "$66.1M"
    label: bookings
    year: 2019
    sourceUrl: https://www.fool.com/earnings/call-transcripts/2020/02/05/glu-mobile-inc-gluu-q4-2019-earnings-call-transcri.aspx
tech: [PHP, Kotlin, MySQL, AWS ECS, Redis, Memcached, Blackfire.io, GitLab CI, Jenkins]
images:
  - src: ../../assets/projects/covet-fashion/facebook.jpg
    alt: "Three models in dark fantasy outfits, the center one in a purple winged gown, above the Covet Fashion logo"
    attribution: https://www.facebook.com/covetfashion/
links:
  - label: App Store
    url: https://apps.apple.com/us/app/covet-fashion-dress-up-game/id620112416
---
Covet Fashion is a mobile casual free-to-play dress-up mobile game. Covet Fashion was a revenue driver for Glu Mobile, with $66.1M in bookings in 2019. I was on the server team, working in a legacy PHP codebase. Most of the job was balancing modernization with new features, and setting up team practices that gave the game a stronger foundation. I stayed until shortly after EA acquired Glu and our team became part of EA Mobile in 2022.

## Key features

### Covet Collection Pass 

I integrated and supported Glu Mobile's subscription microservice into Covet Fashion's monolithic **PHP** codebase. This involved communicating with internal stakeholders on the Covet Fashion team as well as stakeholders from the wider Glu Mobile team. This ultimately became the backbone of the Covet Collection Pass, which contributed to a 30% revenue increase on the year.

### Kotlin microservices

I was part of a three-engineer team tasked with abstracting and migrating parts of our monolithic **PHP** codebase into **Kotlin** microservices that were designed to be used across teams at Glu Mobile. Our first microservice was a metrics microservice, that was used to create the achievements system for Covet Fashion.

### PHP modernization and optimization

I handled migrating our PHP codebase from 5.x to 7.2, along with associated necessary upgrades for supporting services such as **Redis**, **Memcached**, and **MySQL**. The upgrades resulted in an overall 50% decrease in average request response time, tracked across API routes using **Blackfire Profiler**. 

### New User Flow update

One of the most used features I worked on was an update to our New User Flow. I worked with designers, artists, and other engineers to abstract our New User Flow into a system that would support many types of New User Flow. A big part of this New User Flow re-design was supporting dynamic New User events, which was controlled through an internal dashboard tool that I wrote in **PHP** and **JavaScript**.

### CI/CD and mentoring

I maintained our **Jenkins CI/CD pipelines**, creating jobs across environments that allowed things such as: giving stakeholders access to daily builds of our game, flushing Redis caches on command, and ensuring code is properly pushed to designated environments.