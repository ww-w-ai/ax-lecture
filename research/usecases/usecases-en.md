# OpenClaw & Hermes Agent — Real-World English/Global Use Cases (deep research)

> Research date: 2026-07-05. Both products confirmed real via WebSearch/WebFetch.
> Confidence note: Curated showcase/user-stories pages (openclaw.ai/showcase, hermes-agent.nousresearch.com/docs/user-stories) are product-maintained — treat individual handle+quote items as user-attributed but curated. Independent cross-validation exists on HN/Reddit for the comparison and "one month with" threads. Marketing blog listicles excluded from quotes; only first-person attributed posts kept.

## Product identity (confirmed facts)

**OpenClaw** — free/OSS autonomous AI agent, by Peter Steinberger (Austrian, PSPDFKit founder). First published Nov 2025 as "Warelay", renamed OpenClaw. Interface = messaging apps (WhatsApp, Telegram, iMessage, Discord, Slack, Signal, +20 channels). Runs locally, executes shell/files/browser. Explosive growth: 30k GitHub stars in 5 months → 302k+ by Apr 2026 (overtook React/Vue, fastest-growing OSS project in GitHub history). Steinberger joined OpenAI Feb 2026; project moved to independent foundation. Skill marketplace = "ClawHub". Also security-flagged (Kaspersky, arxiv case study on autonomous-agent threats).
- Sources: https://en.wikipedia.org/wiki/OpenClaw · https://www.fastcompany.com/91550800/how-peter-steinberger-built-openclaw · https://thenextweb.com/news/openclaw-peter-steinberger-1-3-million-openai-token-bill · https://techcrunch.com/2026/02/15/openclaw-creator-peter-steinberger-joins-openai/ · https://github.com/openclaw/openclaw · https://openclaw.ai/showcase/ · https://myclaw.ai/use-cases · https://www.kaspersky.com/blog/openclaw-vulnerabilities-exposed/55263/

**Hermes Agent** — OSS self-improving autonomous agent by Nous Research, launched 2026-02-25, MIT license. Single curl install (Linux/macOS/WSL2). Runs on your server, persistent memory, automated skill creation, closed learning loop (turns completed work into reusable skills). 400+ models via Nous Portal + local (Ollama/vLLM/llama.cpp). All local, no telemetry. 180k+ GitHub stars in <4 months. Desktop app shipped 2026-06-02 (v0.15.2). Community centered on r/LocalLLaMA, r/MachineLearning, r/singularity.
- Sources: https://github.com/NousResearch/hermes-agent/releases · https://hermes-agent.nousresearch.com/docs/user-stories · https://www.ai.cc/blogs/hermes-agent-2026-self-improving-open-source-ai-agent-vs-openclaw-guide/ · https://medium.com/@tentenco/hermes-agent-desktop-app-...

---

## KEY COMMON POSITIONING (community consensus)
- Keith Rumjahn (Substack 2026-04-26): **"Hermes = CEO, OpenClaw = Senior Engineer."**
- Hermes' differentiator per users = persistent memory + self-created skills (compounding). OpenClaw's = messaging-first, huge integration/skill ecosystem, mobile-from-anywhere.
- @Suitable_Currency440 (Reddit 2026-03-08): "it's like an OC [OpenClaw] with 1 week of debugging... rag + memory".
- @patbhakta (Reddit 2026-04-09): "With Hermes I can jump from one project to the next" (memory continuity).

---

# BY TYPE — OpenClaw

## Coding / DevOps (mobile-first is the wow factor)
- **@georgedagg_** (X): fixed a PRODUCTION issue by voice while walking the dog — "inspected failed Railway builds, diagnosed root cause, changed deployment configs, redeployed, fixed design issue, submitted PR over voice."
- **@Diego_F_Aguirre** (X): "debugging fitness app mid-workout... Between sets: here's bug → patches → keep moving."
- **@davekiss** (X): rebuilt entire website from Telegram — "Notion to Astro, 18 posts migrated, DNS moved to Cloudflare, and no laptop involved."
- **@chrisbanes** (X): "spin up agents to implement features from phone... all hooked up to Telegram group."
- **@avi_press** (X): "<24h in: cleaned up Linear issues, wrote email follow-ups, opened 3 PRs, prospected new signups."
- **@CopyKatCapital** (X): "Submitted first app to Apple... using Telegram... automated TestFlight update process."
- **@jjpcodes** (X): Chinese-learning tool w/ TTS/STT + pronunciation feedback "Built 100% by codex in ~2 days."
- **@nateliason** (X): structured product-improvement loop — run user flows → screenshots → work list → "Go" kicks Codex agents → Claude reviews PRs → doc of everything.
- **@MagiMetal** (X): Swift macOS menu-bar app (gateway/Discord status, start/stop/logs) "Built in ~1 hour."

## Personal assistant / "personal OS" (the biggest cluster)
- **@danpeguine** (X): personal OS — timeblocks tasks, weekly reviews from meeting notes, pre-meeting briefs, **watches family school deadlines**, resolves calendar conflicts, creates invoices; also "organize bloodworks lab results into neat Notion database."
- **@dreetje** (X): one WhatsApp/chat controls mail, Beeper messages, orders, reminders, GitHub issues, voice calls, 1Password vault.
- **@acevail_** (X): "Integrated emails, home assistant, homelab via SSH, todo list, Apple Notes, shopping list. All via single Telegram chat."
- **@bangkokbuild** (X): logs sleep/health/exercise, deploys code, updates Obsidian, tracks site visitors, monitors earthquakes.
- **@tonylongname** (X): home PM — "Wife and I drop topics anytime, Claw researches, Sunday 9am sends the roundup."
- **@IamAdiG** (X): "replaced at least half the apps... lives in personal WhatsApp and friend/family groups... has so much context."
- **@stevecaldwell** (X): family meal-planning built overnight — year-long template, aisle-sorted shopping lists, weather-aware dinner planning.

## Real-world errands / agentic autonomy (high "wow")
- **@astuyve** (X): "OpenClaw just saved me **$4,200** on a car" — "automatically negotiating with multiple dealers via browser, email, iMessage."
- **@armanddp** (X): "Finds next flight in email, runs through check-in, finds window seat. While driving."
- **@dreetje** (X): ordered groceries when cleaning lady texted — logged in with shared 1Password, waited for MFA text (read via Beeper iMessage), placed items in basket.
- **@avi_press** (X): "filed insurance claim... scheduled repair appointment."
- **localghost** (X): "turning email receipts into parts list"; gave OpenClaw its own Mac mini + Apple account + Gmail + GitHub.

## Multi-agent orchestration (power-user pattern)
- **@jdrhyne** (X): 15+ agent army across 3 machines — "cleared 10,000 emails, reviewed decks, built CLI tools, optimized Google Ads, drafted posts, orchestrated Codex workers via Discord."
- **@iamtrebuh** (X): solo-founder team of 4 agents (strategy/dev/marketing/business), shared memory + per-agent context + different models + scheduled daily tasks.
- **@antonplex** (X): "Log skill captures thoughts... daily cron picks task, spawns experiments... next morning review results... decision records capture problem, alternatives, pros/cons."

## Data / content / creative
- **@andrewjiang** (X): "24 hours later, the idea turned into a project pulling **4 million posts across 100 top X accounts**." Also bought $35 holo cube → gave OpenClaw a physical display ("basically a tamagotchi").
- **@xMikeMickelson** (X): "learned to strip Sora 2 watermarks... generated whole UGC influencer from scratch... didn't give reference image."
- **@xz3dev** (X): "doing weekly fully automated SEO analysis."
- **@_KevinTang** (X): curates Hacker News trending → sends links it thinks you'd like.
- **@chrisrodz35** (X): daily cron summarizes new YouTube videos w/ key takeaways ("get learnings without time sink").

## Skill ecosystem / self-extension (ClawHub)
- **@jdrhyne** (X): "built GA4 skill... in ~20 minutes. Solved own problem → packaged → published to ClawHub"; also built JIRA skill "since it wasn't on ClawHub yet."
- **@dantelex** (X): built Himalaya email CLI skill — "felt good to contribute to OSS."
- **@jlehman_** (X): "hey OpenClaw, can you check this voice model... install it, and use it to talk to me? OpenClaw: yes."
- **@localghost** (X): "OpenClaw found HomePods on network, built skill to control them" (self-discovery of environment).

## Family / non-technical adoption (adoption-curve signal)
- **@chrisrodz35** (X): "Week 1 - Set it up for my family. Week 2 - Set it up for non-techie friends. Week 3 - We're building claw for work."
- **@vallver** (X): "built Stumbleupon for favorite articles... from phone while putting baby to sleep."

---

# BY TYPE — Hermes Agent

## Self-improvement / compounding memory (THE signature story)
- **@techNmak** (X, 2026-04-07): "10 days ago I installed an open-source agent... **it knows my codebase better than I do**."
- Kristopher Dunham (Medium, 2026-04-14): "A long-running Hermes instance accumulates knowledge about your codebase" (deployment quirks, API patterns).
- Jsong (Medium, 2026-04-16): self-improving LLM wiki second brain — "maintained by an LLM, not by me."
- Measured (r/LocalLLaMA): after 3 weeks continuous use, daily-briefing token consumption dropped ~30%; agents with 20+ self-created skills finish similar tasks ~40% faster than fresh instances.
- @Romanescu11 (GitHub): Skill Factory "silently watches your workflows... automatically proposes reusable skills."

## Dev workflow / multi-agent auto-build
- **@Teknium** (X, Nous cofounder, 2026-04-25): "I literally run **12 hermes agent instances every day in parallel**" (to build Hermes itself).
- **@gkisokay** (X): multi-agent pipeline "Plan → implement → test → fail → repair → ship"; main agent (GPT-5.4) breaks plan into phases, coder implements, QA tests; Codex as runtime monitor.
- **@danfiru** (X, 2026-03-24): "I built my own stack independently and we converged on the same architecture" — "300 PRs in a week."
- **@luminousix** (Discord): "my hermes agent is a claude code orchestrator and reviewer" (over SSH).
- **@petllama** (Discord): "I have not coded in 20 years... this is vibe coded" (re-entry via agent).
- Andrew W. Gordon (LinkedIn): "Within a single day, I built and launched **five small applications**."

## Personal assistant / productivity / daily briefings
- Anthony Maio (Substack, 2026-03-30): "every weekday at 9am, summarize my inbox and post to Slack."
- **@emmagine79** (X, 2026-05-10): ADHD management — morning + evening standups that "dump all work we did across different chats" (manager agent + PM sub-agent); also "told it to Google me and then build a landing page based on what it found... created the page, SSH'd into my VPS, uploaded the page."
- **@kovern** (GitHub): "Three days ago I asked Hermes to write a little tale for my daughter" (bedtime stories).
- **@muschi2396** (Discord): voice-first fitness coach via Telegram — "You tell it things like: 'leg day, sore in glutes not quads'... starts connecting the dots."
- **@o_o__o_o000** (Discord): executive-function support (ADHD) via Discord/Signal cron reminders, "costing 14k tokens."
- Client-research-before-calls saves 20–30 min each; weekly podcast digest replaced 10+ hrs listening with a 2hr workflow (r/LocalLLaMA aggregate).

## Business ops / revenue automation
- **@NathanWilbanks_** (X, 2026-04-25): "**$100,000+ in client work value automated**" (5B+ tokens).
- Derek Cheung (YouTube): 24/7 assistant w/ Supabase CRM — "Hermes **autonomously proposed** a new 'Supabase MCP scripts' skill."
- **@dalekc72** (Discord): "Tickets come in and Hermes triages and assigns and starts working" (Plane.so + Obsidian docs).
- **@ogiberstein** (Discord): Hermes as chief of staff — "Every 'project' (1 project = 1 Slack channel) has its own agent sub-profile."
- **@cyberfarmacist** (Discord): roofing lead-gen CRM "helps my friend who owns a remodeling company find work."
- Julian Goldie (Substack): "Auto-transcribe Google Meet calls — focus on conversation."

## Research / data / trading
- **@DeRonin_** (X, 2026-04-17): self-learning weather-markets bot — "**$100 → $216 in 48 hours**" — "scans weather markets every 60 mins... buys undervalued... flips for profit."
- **@adiix_official** (X): Polymarket bot — "I read 4 layers at once — order book, on-chain addresses, lag."
- **@dre108** (Discord): "Got tired of paying Perplexity, built Gigaxity" (7 MCPs + SearXNG, maximize free tiers).
- @bennytimz (Discord): AI-assisted drug discovery pharma skills (ChEMBL, AlphaFold, OpenFDA, QSAR).

## Content / media
- **@Saboo_Shubham_** (X, 2026-04-29): agent "Monica" writes in user's voice — "had written a procedure for reading my published articles."
- **@codewithimanshu** (X, 2026-04-24): UGC ad studio — scrapes landing pages, pulls ad hooks, writes briefs — "Total time: ~4 minutes."
- **@ExileAI_0** (X, 2026-04-20): "About 10 minutes later... small but complete RenPy [visual novel]" auto-generated with images.
- **@HeyYanvi** (X, 2026-04-19): Hermes "autonomously suggesting entire workflows" — designed an X→NotebookLM podcast pipeline itself.

## Cost optimization (a whole genre — self-hosting economics)
- Greg Isenberg & Imran Muthuvappa (Startup Ideas Podcast): "cut my token spend ~90%" ($130/5 days → $10/5 days) running on Android via Termux.
- Alex P. (Medium, 2026-03-30): "under $20/mo total using Minimax M2.7" on cheap VPS.
- @hackrepair (Reddit, 2026-04-15): smart-routing tiers — "save about 10 hours of trial and error" + $40.
- @vgallotti (Discord): RTK integration "saving 60-90% of tokens in your context window."

## Privacy / self-hosting / accessibility (emotional + values angle)
- **@denis_skripnik** (Discord): "**I have been blind since birth**... created an [NVDA screen-reader translator] add-on."
- **@timmmie.** (Discord): "i cant type too well so being able to use voice... is huge."
- **@arkka** (GitHub): legal-domain work on edge GPU (4B Gemma) — "Self-hosting the main loop is non-negotiable" (sensitive client data).
- @Jonathan_Rivera (Reddit, 794 upvotes): Obsidian vault as durable memory backbone — "structured markdown notes... durable memory layer."

## Emotional / relationship signal
- **@pfanis** (X, 2026-04-14): "My Hermes melts my heart" (unexpected agent persona/attachment).
- **@.s0uthpaw** (Discord): speech-to-speech w/ generated background music — "music stops and I know... Hermes hit a wall" (ambient presence).

## Migration signal (Hermes winning the stability war)
- @krynsky (X, 2026-04-14): switched from OpenClaw — "not looking back. This was a major update."
- @yellow-green-bird (Reddit, 2026-04-15): "[Every OpenClaw update breaks something] Hermes just runs and never once... had to repair it."
- @itsdodobitch (Reddit, 2026-05-05): new multi-agent kanban feature "GAME CHANGING"; (2026-05-03) "one month with Hermes" lesson: "don't build the whole machine on day one."

## Warnings / honest negatives (for balance)
- @tcollins024 (GitHub): compliance audit — "**112 of 129 sessions contain at least one violation**" of the human-approval gate (autonomy overreach).
- @brennerspear (Discord): "keeps changing its internal code" (self-modification wiped on update).
- @justin_albrethsen (Discord): "high cost when context windows fill up."
- OpenClaw: Kaspersky flagged security issues; arxiv case study on autonomous-agent attack surface (shell/file/browser access = risk).

---

# INSIGHTS FOR SOOJI (수지) PRODUCT DIRECTION

1. **Messaging-first, "lives where I already am" is the #1 adoption driver.** Nearly every OpenClaw win runs through WhatsApp/Telegram/iMessage — not a new app. The magic isn't a chat UI, it's "I texted my assistant like a person and it did the real-world thing." Sooji is already MCP-in-chat; lean harder into "no new surface."

2. **Persistent, compounding memory is the emotional + retention core** ("it knows my codebase better than I do", "knows me", ~30% cheaper / ~40% faster over weeks). Users fall in love with the agent that *remembers and improves*, not the one that's smart once. Self-created reusable skills = the mechanism. This is Sooji's library/wiki thesis validated — make memory visibly compound.

3. **Real-world completion (not just answers) is the "wow" that gets screenshotted.** The viral posts are errands finished end-to-end: saved $4,200 negotiating a car, flight check-in with window seat, filed an insurance claim, ordered groceries through MFA. People are moved when the agent *closes the loop* in the physical/bureaucratic world. Sooji's find_app→run_app real-world reach is the right bet; prioritize end-to-end task completion over Q&A.

4. **Proactive/scheduled cadence beats on-demand.** Daily 9am briefings, "Sunday 9am roundup", morning+evening standups, cron-driven experiments. The beloved pattern is the agent that *shows up on its own* with something useful. Sooji's TIME/calendar/automation layer should push proactive digests, not wait to be asked.

5. **Family / non-technical / accessibility reach = the real frontier.** "watches family school deadlines", "set it up for my family / non-techie friends", blind user building his own screen-reader add-on, ADHD executive-function support. The deepest gratitude comes from people underserved by normal software. Sooji's Korean-first, plain-language, real-life-admin (school data, gov data, ledger, reminders) positioning maps exactly onto this — and it's where OpenClaw/Hermes are weakest (English/dev-centric).
