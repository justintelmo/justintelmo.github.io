# Justin Telmo's portfolio website

This is a portfolio website I made, largely with the help of Claude. I worked with Claude to plan, design, and scaffold my site. It recommended that I build this website using the Astro framework, which allows for TypeScript support. The website is largely data-driven, with the data mainly coming from a combination of my Resume and lived experience. This project is deployed on GitHub Pages for ease of use, since there is very little back-end work necessary for this website, save for the Ask About Me box, which will be covered later. 

## Skills

These skills were used and leveraged for the creation of this website, outside of ones built into Claude Code / claude.ai:
  - design-taste-frontend: https://www.tasteskill.dev/
  - Cloudflare plugin: https://developers.cloudflare.com/agent-setup/claude-code/
  - Superpowers: https://claude.com/marketplace/plugins/superpowers
  - Impeccable: https://impeccable.style/
  - vercel-react-best-practices: https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices

## Architecture

The layout and architecture of the website is fairly straightforward: It is a list of `*.astro` components that are laid out in `Base.astro` and `index.astro`. There is a Hero banner giving a one-line introduction of myself and screenshots of some of the games I've worked on. There is also an easily accessible row of links to various methods of contact and a link to my Resume as a file for recruiters to download. 

Below that is a Carousel component that highlights my engineering experience by spotlighting individual games for seconds at a time. The Carousel can be manually controlled, resumed, and paused as it cycles through projects. 

Part of the Carousel components are the Game cards, which are small, individual, data-driven components used to illustrate the games I have worked on as well as the key technologies used for those games. Clicking on any given Game component will take you to a separate page that does a deeper dive into the game, including more granular explanations of the work I had done for those games as well as a more in-depth tech stack and some stats on the games if available.

## Ask about my work

To help understand more about working with LLMs, I built a small chat feature on my portfolio website with the help of Claude. This was built using the Cloudflare plugin on Claude Code. On the client side, I built a small chat box that would take user input and scan through my engineering history to attempt to answer the question. One of the big challenges for this was figuring out how to safely and effectively create guardrails against attackers or malicious actors. While planning this feature with Claude, it became apparent that there needed to be a back-and-forth as we discovered more and more edge and corner cases to account for when prompting into the chat box. If you're reading this, go to the site and ask about my experience!

The cost of asking a question is less than a tenth of a cent, and there are guardrails in place to prevent users from spamming questions. I have a worker that caches site content as part of the prompt, which cuts down on cost per call. Calls are capped at 20 questions per IP and 150 total per day. 