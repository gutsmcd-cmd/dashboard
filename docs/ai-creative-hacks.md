# AI Creative Hacks Library
Real, sourced tips for Mat. Grok first. Free/paid tags reflect the source at time of adding (2026-10-14; GB7/IM7/VI7 and US1–US3 added 2026-10-15; GB8, MU6, US4 added 2026-10-16; SG7, VI8 added 2026-10-18). Limits change often, so check them yourself.
Format: title / tool / cost / what it does / steps / source.

## Grok Bot

### GB1. Ask your Grok Bot to mine your own X feed for jobs it could do
- Tool: Grok Bot · Cost: included with Grok Bot
- What it does: Turns your posts and interests into a list of automations or creative projects you hadn't thought of.
- Steps: 1) Ask: "Search my X posts and the accounts I engage with, and list 10 things you could do for me that you haven't yet." 2) Turn the best ones into skills or routines.
- Source: https://x.com/Soderqu6/status/2109310952239988844

### GB2. Do it once, save it as a skill, then automate it as a routine
- Tool: Grok Bot skills + routines · Cost: included
- What it does: Gives you repeatable creative pipelines (e.g. "make a sticker sheet from today's idea") that run the same way every time.
- Steps: 1) Do the task by hand in chat until it works. 2) Ask the bot to save the steps, inputs, checks and output format as a skill. 3) Reference it with `/`. 4) Only then add a routine, and use Test run first.
- Source: https://docs.x.ai/grok-bot/skills-routines-and-automations

### GB3. Teach a browser workflow by demonstration
- Tool: Grok Bot "Teach a task" · Cost: included
- What it does: You perform a web workflow once (up to 10 min recorded) and the bot drafts a skill from it, which is handy for Photoroom web or other tools that have no API.
- Steps: 1) In a 1:1 chat with the computer view open, choose Teach a task. 2) Describe the result, then do the workflow. 3) Edit the draft skill to add rules and approval boundaries. 4) Test on a safe input.
- Source: https://cursor.com/docs/grok-bot/work

### GB4. One bot per job, with standing rules in its description
- Tool: Grok Bot Bots · Cost: included
- What it does: Specialist bots (hacks hunter, icon maker, game tester) keep cleaner memory than one "General Helper". You can copy a bot with its skills, routines and avatar.
- Steps: 1) Give each bot a narrow job and approval boundary. 2) Put lasting rules in the description, not the chat. 3) Use the copy option to spin up a variant, then rename and rescope it.
- Source: https://docs.x.ai/grok-bot/bots

### GB5. Chain bots: let specialists message each other or share a group chat
- Tool: Grok Bot multi-bot · Cost: included
- What it does: One bot gathers context and hands a clean prompt to another, for example a researcher bot passing to a builder bot.
- Steps: 1) Create specialists. 2) Put them in a group chat when you want to see the handoff. 3) Use a routine to route a request through them.
- Source: https://x.ai/bot/guides/grok-bot-101

### GB6. Routine hygiene: weekly before daily, and a stop condition
- Tool: Grok Bot routines · Cost: included
- What it does: Keeps automated creative runs from spamming you or drifting.
- Steps: 1) Start weekly. 2) Ask for a summary after each run. 3) Review the first 3 runs closely. 4) Add "stop and report if something looks wrong". 5) Delete routines that don't save time.
- Source: https://bestproductivityresources.com/guides/100-spacexai-grok-bot-tips

### GB7. Claim a bot email and wake a routine when mail arrives
- Tool: Grok Bot agent email + routines · Cost: included
- What it does: Gives your bots one `name@mail.grokbot.com` address so they can sign up for tools, collect receipts/newsletters, and start a creative workflow when specific senders write in. Mail alone never wakes a bot; a routine does.
- Steps: 1) Ask a bot for an email address (or Connect apps → Email) and approve the claim; you get one forever, so pick the name carefully. 2) Create a routine that watches that inbox (anyone, one address, or `*@domain.com`). 3) Have it summarize or draft; every send still needs your approval. Skip plus-aliases — `name+tag@mail.grokbot.com` does not deliver.
- Source: https://cursor.com/help/grok-bot/agent-email

### GB8. In Grok Bot voice mode, have the bot post each idea to the chat as you go
- Tool: Grok Bot voice · Fits: Grok Bot · Effort: easy · Cost: included
- What it does: Stops brainstorms from vanishing when you hang up. One user lost 20 minutes of ideas from a voice session because nothing was written down.
- Steps: 1) At the start of a voice call, say "Save each idea and post it in the chat as we go." 2) After hanging up, check the chat and ask for a tidy list.
- Source: https://x.com/itsjohnadp/status/2109821781003698641

## SuperGrok / Grok chat

### SG1. Force live X data with explicit trigger phrases
- Tool: Grok chat · Cost: free (limits) / SuperGrok
- What it does: Gets you raw, real-time X conversation for trend-spotting, such as what's viral in AI art today, instead of a stale summary.
- Steps: Start with "Search X right now for…", "pull recent posts from the last 24 hours about…", or "what are people on X saying about…".
- Source: https://sureprompts.com/blog/how-to-use-grok

### SG2. Use DeepSearch for cited, multi-source research
- Tool: Grok DeepSearch · Cost: SuperGrok for full access (limited on free)
- What it does: Runs iterative web, X and news searches into a cited brief. Takes about 30–60 seconds.
- Steps: Toggle DeepSearch before sending, or start the prompt with "Use DeepSearch:".
- Source: https://aitoolsrecap.com/Blog/how-to-use-grok-2026-complete-guide

### SG3. Projects with their own instructions for each creative stream
- Tool: Grok Projects · Cost: free / SuperGrok
- What it does: Keeps chats, files and project-specific instructions together. Project instructions override your global ones, so a "pink+green brand" project always gets the right palette.
- Steps: 1) Create one Project per app, game or brand. 2) Upload reference files. 3) Write short, non-contradictory instructions.
- Source: https://www.blutrumpet.com/post/grok-custom-instructions-2026
- Tag: usage saver. Long creative back-and-forth in a Project runs on the SuperGrok meter, not Grok Bot's. See US2.

### SG4. Scheduled Tasks for recurring creative briefs
- Tool: Grok Tasks / Automations · Cost: check your plan
- What it does: Grok runs a prompt on a schedule, for example a weekly "5 game-jam themes trending on X".
- Steps: Write a specific prompt, then set the schedule and how it's delivered.
- Source: https://www.mindstudio.ai/blog/grok-automations-scheduled-tasks-email-triggers
- Tag: usage saver. A recurring research or brief job here runs on SuperGrok, not on a Grok Bot routine. See US1.

### SG5. Brief like a pro: role, audience, format, constraints, then refine in the same chat
- Tool: Grok chat · Cost: free
- What it does: Fewer rerolls. Refining in the same chat keeps context.
- Steps: State role, audience, format, length and constraints, then iterate in the same thread instead of starting over.
- Source: https://www.designkit.com/blog/how-to-use-grok-ai

### SG6. Know your tier: SuperGrok vs SuperGrok Plus vs Heavy
- Tool: Grok plans · Cost: SuperGrok ~$30/mo, SuperGrok Plus ~$100/mo, Heavy ~$300/mo
- What it does: SuperGrok Plus (added mid-2026) raises limits on chat, images, voice and app-building. It's worth it only if you keep hitting the $30 caps.
- Steps: Check usage in the app before upgrading, and confirm limits on xAI's site.
- Source: https://lumichats.com/blog/what-is-supergrok-grok-plans-explained-2026

### SG7. In Grok Voice, type while you talk (names, spellings, links)
- Tool: Grok Voice (Grok app) · Fits: SuperGrok · Effort: easy · Cost: SuperGrok pool (Voice also has a free tier)
- What it does: Voice mode listens to typed text and speech at the same time, so you can keep talking and drop in the bits that speech mangles: a Japanese place name, a student's name, an exact lyric line, a URL or a prompt you want quoted word for word.
- Steps: 1) Start a Voice chat and talk normally. 2) When something needs to be exact, type it into the text box mid-conversation and say "use exactly what I just typed."
- Source: https://x.com/jayosays/status/2110429907704811672

## Grok Imagine images

### IM1. Image 2.0 Magic Wand: change one region per turn
- Tool: Grok Imagine Image 2.0 (Quality Mode) · Cost: free within unpublished limits / more on SuperGrok
- What it does: Edits only the selected area, so you don't regenerate the whole image.
- Steps: 1) Generate or upload in Quality Mode. 2) Magic Wand the region. 3) Say only what changes. 4) Say "undo that" if it gets worse. 5) Do the photo first and text second, with exact words in quotes.
- Source: https://x.ai/news/grok-imagine-image-2 (prompt habits: https://usepromptup.com/blog/grok-imagine-image-2-prompts/)

### IM2. Templates: icons, mascots, sprites, emoji, merch, BG removal (transparent PNG)
- Tool: Grok Imagine Image 2.0 templates · Cost: free within limits / SuperGrok
- What it does: 15 preset workflows (Icon Maker, Mascot Maker, Character Sprite, Props & UI Kit, Emoji Creator, Merch Maker, Product Poster…). You only supply inputs. Multi-ref takes up to 5 images.
- Steps: Open grok.com/imagine, choose Quality Mode, pick a template, drop in references, generate, then Magic Wand any fixes.
- Source: https://x.ai/news/grok-imagine-image-2 (list: https://www.dreampixelforge.com/blog/grok-imagine-image-2)

### IM3. Write a design brief, not an adjective pile
- Tool: Grok Imagine Image 2.0 · Cost: free / SuperGrok
- What it does: Gives sharper layouts and readable text, good for posters and app store art. Example: "pink and green neon palette".
- Steps: Give subject, composition, exact quoted text with placement and hierarchy, lighting, and a named style or medium. Leave out vague stacks like "epic, stunning".
- Source: https://wink.ai/blog/grok-imagine-prompts

### IM4. Set the aspect ratio as a setting, matched to where it's going
- Tool: Grok Imagine · Cost: free / SuperGrok
- What it does: Stops awkward crops. Use 1:1 for feeds, 9:16 for stories, 16:9 for widescreen, 2:3 or 3:2 for print, and 20:9 or 9:20 for banners.
- Steps: Pick the ratio in the control, not in the prompt text.
- Source: https://aipromptgeneer.com/craft/cheatsheets/grok-imagine/

### IM5. Multi-reference edits: give each image a role and say what to preserve
- Tool: Grok Imagine Image 2 · Cost: free / SuperGrok
- What it does: Keeps a character or product consistent across scenes.
- Steps: Upload the references and label them ("image 1 = character, image 2 = background"). Say what stays the same and what changes.
- Source: https://morphic.com/resources/how-to/grok-imagine-image-2-guide

### IM6. Check your free cohort before wasting prompts
- Tool: Grok Imagine · Cost: free
- What it does: Free allowances vary (about 2–4 images and up to 1 video a day, or none). Blocked generations still count, and extra accounts don't reset limits.
- Steps: Send one plain image prompt and one plain video prompt to find your allowance, then wait for the reset.
- Source: https://www.roborhythms.com/is-grok-imagine-free/

### IM7. FLUX formula: light first, positives only, chibi/toy shortcuts
- Tool: Grok Imagine (FLUX-based) · Cost: free within limits / SuperGrok
- What it does: Sharper photoreal and text. Lighting is the cue FLUX responds to most; negations ("no glasses") are weak.
- Steps: 1) Write `[subject][action][setting][lighting][camera/lens][style][2–3 quality tags]`. 2) Name lighting explicitly (Rembrandt, neon rim, golden hour). 3) Describe what you want instead of what to avoid. 4) For clean character art, try "chibi style" or "action figure style" as a strong activation pattern.
- Source: https://randomprompts.org/blog/how-to-write-prompts-for-grok-imagine

## Video

### VI1. Free Grok Imagine video on fal.ai (5 clips per rolling 24h)
- Tool: Grok Imagine Video 1.5 Lite via fal.ai · Cost: FREE
- What it does: Free image-to-video with native audio, even if your Grok account has no free video left.
- Steps: Sign in at fal.ai, open fal.ai/grok-imagine-free, upload a start image, prompt the motion, camera and sound, then generate.
- Source: https://fal.ai/grok-imagine-free

### VI2. Prompt formula: one subject, one action, one camera move, explicit light
- Tool: Grok Imagine video · Cost: free (6s) / SuperGrok
- What it does: Fewer wasted generations. For image-to-video, describe the motion, not the image.
- Steps: Write 2 sentences at most: [subject][action], [camera move], [lighting]. Pick the ratio and length, then choose the best variation.
- Source: https://felloai.com/grok-imagine-video-generation/

### VI3. Extend once, then cut (two-act trend clips)
- Tool: Grok Imagine Extend · Cost: SuperGrok / credits
- What it does: Gives 10–12s clips with a clean setup and payoff. Quality falls off after 2 extends.
- Steps: 1) Generate only the "normal" setup. 2) Scrub the last second and trim any glitchy tail. 3) The extend prompt opens with the current state, then the twist. 4) Don't change the shot, and copy the style tag over word for word. 5) For anything over ~18s, cut separate clips together.
- Source: https://www.versely.studio/blog/grok-imagine-extend-continue-videos

### VI4. Clean lip-sync: front-facing, static camera, one short quoted line
- Tool: Grok Imagine Video 1.5 native audio · Cost: free (limits) / SuperGrok
- What it does: Talking characters that actually sync.
- Steps: Use a mouth-visible portrait and static camera. Prompt: "She looks to camera and says, 'I'm ready now.' Calm, clear voice; soft room tone; no music." Write "no music" or "no dialogue" when you want silence.
- Source: https://omniart.studio/blog/models-insights/grok-imagine-native-audio

### VI5. Use Custom mode for precise camera, lighting and audio
- Tool: Grok Imagine video modes · Cost: free / SuperGrok
- What it does: More control than Normal or Fun. One action per clip is the most stable.
- Steps: Pick Custom, then describe the camera, lighting, motion and audio separately, keeping to one action.
- Source: https://prompt-architects.com/blog/297-prompting-grok-imagine-video-1-5

### VI6. API: extend any 2–15s MP4 by 2–10s
- Tool: xAI API grok-imagine-video · Cost: paid API
- What it does: Continues from the last frame of your own clip. Useful inside apps you build.
- Steps: `POST /v1/videos/extensions` with model, prompt, duration and video.url.
- Source: https://docs.x.ai/developers/model-capabilities/video/extension

### VI7. Pin first, last, and mid keyframes (or Loop)
- Tool: Grok Imagine Video 1.5 · Cost: free within limits / SuperGrok
- What it does: Storyboards a clip instead of hoping one still + a prompt holds. You pick how each upload is used: First frame, Intermediate frame, Last frame, Loop, or Reference (look/identity only).
- Steps: 1) Generate or prep stills that share subject, horizon, and camera angle. 2) On each thumbnail, set the role (default is First frame; flip to Reference when you only want style/identity). 3) For a loop, use the same image as first and last. 4) Prompt only the motion and audio between pins. App UI: https://x.com/XFreeze/status/2102761501937266714 · API also supports up to 4 timed mid-keyframes on `grok-imagine-video-1.5`.
- Source: https://x.com/XFreeze/status/2102761501937266714 · https://x.com/mark_k/status/2106472336048423128 · https://docs.x.ai/developers/model-capabilities/video/reference-to-video · https://metagrok.io/how-to/pin-keyframes-on-imagine-video

### VI8. Keep the subject still and let the camera move, plus one small motion detail
- Tool: Grok Imagine video · Fits: SuperGrok · Effort: easy · Cost: free within limits / SuperGrok
- What it does: Fewer broken clips. Slow push-ins, crane rises and drone pull-backs around a calm subject stay clean, while big physics (crashing waves, explosions) is where AI video falls apart. One small, specific motion phrase ("sand blowing off the ridgeline", "barely rippling reflections") makes a still scene feel alive without breaking it. Great for space and nature shots like an Earthrise from the Moon.
- Steps: 1) Write: still subject + setting, one slow camera move, light, lens (e.g. "35mm"). 2) Add exactly one small motion detail and skip anything explosive.
- Source: https://x.com/DaQin99/status/2111447355178508426 · https://x.com/DaQin99/status/2111085832044253633

## Music

### MU1. Suno free: 50 daily credits, Custom mode with your own lyrics
- Tool: Suno · Cost: FREE (non-commercial; Suno owns free songs)
- What it does: Gives roughly 5–10 songs a day for experimenting. Custom mode separates lyrics from the style description.
- Steps: Sign up at suno.com, choose Custom, paste your lyrics, write the style prompt, then generate variations and keep the prompts that work.
- Source: https://awesomeagents.ai/guides/how-to-make-music-with-ai/

### MU2. Save your 7 lifetime free downloads for keepers
- Tool: Suno · Cost: free (7 lifetime trial downloads); Pro gets 20/month with commercial rights
- What it does: Since Sept 3, 2026, downloads are capped. Streaming and sharing on Suno are still unlimited.
- Steps: Share songs by Suno link, and download only the final picks. Upgrade if you need a track in a released game or app.
- Source: https://help.suno.com/en/articles/13614785

### MU3. Use Suno for exports and Udio only to audition sound
- Tool: Udio · Cost: free 10 credits/day (max 3 songs)
- What it does: Udio has strong vocals, but audio, video and stem downloads are disabled, even for paid plans.
- Steps: Try ideas in Udio, then rebuild the keeper in Suno if you need a file.
- Source: https://www.chartlex.com/blog/marketing/ai-music-generator-comparison-2026

### MU4. Build a beat machine with Grok Build
- Tool: Grok Build · Cost: free on all plans
- What it does: xAI's own example is a 16-step drum sequencer with 808, techno and lo-fi kits, swing, and "beatbox into the mic to make a pattern".
- Steps: Paste xAI's example prompt into Build, then publish to grok.me.
- Source: https://x.ai/news/grok-build-for-everyone

### MU5. ElevenLabs Music for commercial use on a cheap plan
- Tool: ElevenLabs Music · Cost: free about 11 min/month (non-commercial); $6/mo Starter is commercial
- What it does: A cheap legal path to game or app soundtracks.
- Steps: Generate on the free plan to test, then move to Starter before shipping.
- Source: https://www.chartlex.com/blog/marketing/ai-music-generator-comparison-2026

### MU6. Grok Imagine Music: give your Imagine video its own soundtrack, with lyrics (TOP PICK, Oct 16)
- Tool: Grok Imagine (new, mid-Oct 2026) · Fits: SuperGrok · Effort: easy · Cost: uses your Imagine allowance; check limits
- What it does: Makes a full music track inside Imagine and puts it on your clip, so a science or animal short gets a matching song without going to Suno. Early users say it's not Suno quality but fast and decent. Tracks save to your library to reuse.
- Steps: 1) Open a video you made in Imagine, tap the music badge or "Replace Audio", then "+ Add music". 2) Describe genre, mood, tempo (BPM), instruments and vocals, and paste your own lyrics if you like. Preview it, then apply. Example style line: "dark synthwave × cinematic techno, 145 BPM, deep pulsing bass".
- Source: https://x.com/alexutopia/status/2110409060759515449 · https://x.com/LaceyPresley/status/2110250629125800145 · https://x.com/karatademada/status/2110362488051056691

## Apps

### AP1. Grok Build: describe an app and get a live, working preview in chat
- Tool: Grok Build · Cost: FREE on every plan (web, iOS, Android) since Aug 2026
- What it does: Builds apps, games, sites and dashboards live in chat.
- Steps: Open Grok, describe the app, then iterate.
- Source: https://x.ai/news/grok-build-for-everyone
- Tag: usage saver. Building and iterating apps or games in Grok Build on grok.com uses the SuperGrok pool (it shows as "Build" in Settings → Usage), so the bots only need to step in for files, repos or multi-step jobs. Usage source: https://docs.x.ai/grok/faq

### AP2. Publish to grok.me with an auto-generated cover that unfurls on X
- Tool: Grok Build publish · Cost: free
- What it does: Each app gets a grok.me link, access control (just you, anyone with the link, or public), an optional custom domain, and AI cover art. On X, games show a play button in the card.
- Steps: Click Publish, set access, and regenerate the cover or ask Grok to redesign it (pink+green).
- Source: https://x.ai/news/grok-build-for-everyone

### AP3. Turn on the SpaceXSI APIs so your app can call Grok with no keys
- Tool: Grok Build · Cost: free toggle (check usage)
- What it does: Your app can generate chat, images or voice at runtime, for example a trivia game that writes new questions. You can revoke access per app.
- Steps: Enable the SpaceXSI APIs for the app, then ask Grok to wire the feature in.
- Source: https://x.ai/news/grok-build-for-everyone

### AP4. Export to GitHub, then keep going in an editor
- Tool: Grok Build · Cost: free
- What it does: Moves a prototype into real code. It also supports Secrets for third-party keys and Remix so others can fork your app.
- Steps: Use Export to GitHub, then continue in your editor or Grok Build in the terminal.
- Source: https://x.ai/news/grok-build-for-everyone

### AP5. Use Build Mode's templates and examples as starting points
- Tool: Grok Build Mode · Cost: free
- What it does: Lets you create and share websites, apps and games from xAI's showcase.
- Steps: Browse the Build Mode page, then remix an example.
- Source: https://x.ai/grok/build-mode

## Games

### GA1. Copy xAI's proven game prompts
- Tool: Grok Build · Cost: free
- What it does: Gives real published examples: a calm endless 3D forest driver, an isometric city sim with a live economy, and a 3D physics playground with gravity and friction sliders.
- Steps: Paste a prompt, play it, then add one tweak per prompt.
- Source: https://x.ai/news/grok-build-for-everyone

### GA2. Scope tightly: one mechanic, one twist, no extras
- Tool: Grok Build / any AI coder · Cost: free
- What it does: Gets a finished playable slice instead of a broken sprawl.
- Steps: Ask for a goal, controls, win/lose, and vanilla HTML/JS. Explicitly exclude multiplayer, levels and settings at first. Add polish one prompt at a time.
- Source: https://www.buildwithgrok.com/pages/21-walkthrough-first-game.html

### GA3. Paste exact console errors and ask for the smallest fix
- Tool: any AI coder · Cost: free
- What it does: Debugs faster and avoids rewrites. Use colored shapes before art, aim for 60 FPS, and test resize and touch.
- Steps: Test after each change, copy the console error, and ask for "smallest fix only".
- Source: https://vibedgame.com/guide/make-a-game-with-ai

### GA4. Make browser games "feel finished"
- Tool: Grok Build · Cost: free
- What it does: A guide to the polish steps that make a vibe-coded game feel complete.
- Steps: Follow the browser-games lesson after your playable slice works.
- Source: https://grokbuilders.com/learn/browser-games

### GA5. Free local sprite pipeline: Agent Sprite Forge
- Tool: agent-sprite-forge (MIT) · Cost: FREE (uses your image model)
- What it does: Generates sprites, cleans them up, slices sheets, and exports to Godot or Unity.
- Steps: Clone the repo and follow the README for Grok or Codex image generation and export.
- Source: https://github.com/0x0funky/agent-sprite-forge

### GA6. Hosted sprite generators with free credits
- Tool: Spritefy / Spriterrific / Ludo.ai · Cost: free starter credits (150 / 500 / 30), then paid
- What it does: Makes sprite sheets and tiles on demand.
- Steps: Sign up, generate a sheet, and drop it into your game.
- Source: https://spritefy.com/ · https://spriterrific.com/ · https://ludo.ai/

## Thermal printing

### TP1. shortorder: turn a USB receipt printer into an MCP tool for AI agents
- Tool: shortorder (Go binary) · Cost: FREE / open source
- What it does: Agents can print text, receipts, QR codes, barcodes, images and SVG, then cut. Works with no drivers or cloud on Win, Linux and Raspberry Pi, and is found on the LAN via mDNS.
- Steps: Run the binary next to your 58/80mm ESC/POS printer and point an MCP-aware agent at it.
- Source: https://github.com/aphexddb/shortorder

### TP2. thermal-mcp: good-looking Markdown/HTML prints on a $30 printer
- Tool: thermal-mcp · Cost: FREE / open source
- What it does: Renders with Chromium, dithers to 1-bit (Atkinson by default), and tunes heat and density. Works over USB, Bluetooth or CUPS.
- Steps: Install, set THERMAL_DITHER and heat variables if prints fade, and use dry-run to preview PNGs.
- Source: https://github.com/EthanPany/thermal-mcp

### TP3. Print Notion tasks or Markdown to-do cards with QR codes
- Tool: mcposprint · Cost: FREE
- What it does: Prints daily task cards from Notion or Markdown, plus arbitrary images.
- Steps: Install with uv, connect the USB ESC/POS printer, and use process_static_cards or process_notion_tasks.
- Source: https://github.com/bhandzo/mcposprint/

### TP4. A preview-then-confirm print tool
- Tool: posprint-mcp · Cost: FREE
- What it does: Agents preview the receipt and need a confirmation token before printing, so nothing prints by accident. HTTP mode requires an auth token.
- Steps: Set PRINTER_URI (CUPS) and call print in preview mode, then confirm.
- Source: https://github.com/bestimmaa/posprint-mcp

### TP5. Dither AI art in the browser before printing stickers
- Tool: Phomymo (web) / label_printer · Cost: FREE
- What it does: Converts AI images to black-and-white with a dither preview that matches thermal output, for Phomemo-style printers.
- Steps: Generate an image (high contrast, line art), open it in Phomymo, pick dithering, preview, then print.
- Source: https://github.com/transcriptionstream/phomymo · https://github.com/bladnman/label_printer

### TP6. Phomemo P3M: an AI sticker printer driven by voice and drawings
- Tool: Phomemo P3M · Cost: PAID hardware
- What it does: Turns voice prompts, doodles and photos into monochrome thermal stickers (53mm, Bluetooth).
- Steps: Speak or draw a prompt in the app, apply an AI filter, then print.
- Source: https://phomemo.com/products/phomemo-p3m-ai-sticker-mini-printer

## Photoroom

### PR1. Free Utilities don't use AI credits
- Tool: Photoroom · Cost: FREE (daily limit; personal use only)
- What it does: Background Remover, AI Expand, Image Enhancer, preset AI Shadows, Resize and Retouch run on a daily limit instead of credits.
- Steps: Use these first. Save credits for generative features, and wait for the daily reset if you hit the cap.
- Source: https://help.photoroom.com/en/articles/15934542-daily-usage-limits

### PR2. Watch the 100/month free export cap
- Tool: Photoroom · Cost: free 100 exports/month
- What it does: Exports and AI credits are separate, and every download or share counts as an export.
- Steps: Finish edits before exporting, and batch your final exports.
- Source: https://help.photoroom.com/en/articles/15284788-export-limit

### PR3. Batch AI backgrounds with "Batch consistency"
- Tool: Photoroom Batch (web) · Cost: AI credits
- What it does: Gives a whole product set (stickers, merch, game cards) one matching AI scene.
- Steps: Open Batch, choose Background, then Remove original backgrounds, then AI, enter a prompt or theme, and turn on Batch consistency.
- Source: https://help.photoroom.com/en/articles/14170573-change-the-background-of-a-batch-of-images-web-app

### PR4. "Apply recent edits to all" for logos and watermarks
- Tool: Photoroom · Cost: free/paid
- What it does: Stamps the same logo or sticker layer onto every selected image.
- Steps: Edit one image, Insert the logo, then choose Apply recent edits to all.
- Source: https://help.photoroom.com/en/articles/11401815-how-does-apply-recent-edits-to-all-work

### PR5. Prompt like a photographer, and use an image as the background prompt
- Tool: Photoroom AI images/backgrounds/video · Cost: AI credits
- What it does: Fewer rerolls and consistent backgrounds across many shots.
- Steps: Describe subject, setting, colors (pink+green), lighting, camera framing and intended use, and add negatives. For consistency, upload an image as the background prompt.
- Source: https://help.photoroom.com/en/articles/10411369-write-more-effective-prompts-for-ai

### PR6. Grok Imagine BG Removal, then Photoroom for staging
- Tool: Grok Imagine BG Removal template + Photoroom · Cost: free within limits
- What it does: Gets a transparent PNG from Grok, then uses Photoroom shadows and backgrounds for store-ready art.
- Steps: Run the Grok BG Removal template, export the PNG, then open it in Photoroom and add AI Shadows (a free utility).
- Source: https://x.ai/news/grok-imagine-image-2 · https://help.photoroom.com/en/articles/15934542-daily-usage-limits

## Other

### OT1. Free Gemini image editing: direct like a creative director
- Tool: Gemini app (free tier uses Nano Banana 2 Lite since 2026-10-09; resets every 5h with a weekly cap) · Cost: FREE
- What it does: Better first images and consistent edits.
- Steps: Specify subject, action, location, composition, style, lighting and ratio. Quote on-image text, then refine in the same chat.
- Source: https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana (free tier: https://thenextweb.com/news/gemini-flash-lite-free-users-nano-banana-2-1)

### OT2. Blend multiple reference images for consistent characters
- Tool: Gemini / Nano Banana · Cost: free (limits)
- What it does: Combines a character, a product and a background into one scene.
- Steps: Upload the references, say which element comes from which image, add camera and lighting, then fix small text in follow-ups.
- Source: https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/

### OT3. AutoSprite MCP: animated sprite sheets straight into your project
- Tool: AutoSprite · Cost: check pricing
- What it does: An MCP server that builds animated sprite sheets and JSON atlases from your coding agent.
- Steps: Add the MCP server and ask your coding agent for a walk cycle.
- Source: https://www.autosprite.io/codex

## Usage savers (SuperGrok over Grok Bot)
Why: on a legacy setup where SuperGrok is linked to Grok Bot, the two have separate weekly meters (Grok Bot's is on the Cursor account), so moving work to grok.com saves Grok Bot usage. On The X Subscription (since Oct 12, 2026), Grok Bot draws from the same shared pool, so check Settings → Usage in both apps first. Sources: https://cursor.com/help/grok-bot/faqs · https://cursor.com/help/grok-bot/plans · https://docs.x.ai/x-subscription/usage-limits

### US1. Move recurring research jobs from Grok Bot routines to Grok Automations
- Tag: usage saver
- Tool: Grok Automations (grok.com/automations, iOS, Android) · Cost: schedules on all accounts; email triggers need SuperGrok
- What it does: Grok runs a saved brief once, daily, weekdays, weekly, monthly or yearly in your timezone, or when an email that matches a sender, recipient or subject filter arrives. Each run is a full conversation you can reopen and continue, and you can get the result by email, app notification, both, or neither. Good candidates are trend scans, "new Imagine tricks on X this week" and inspiration digests, which a bot routine would otherwise run. Builds on SG4.
- Steps: 1) Make one directly in chat ("every Monday 9am, find 5 trending game-jam themes on X with links") or start from a template. 2) Add files, connectors (@) or skills if needed. 3) Press Run now once to test it. 4) Pick how results reach you. 5) Pause the matching Grok Bot routine, and keep bots for jobs that need files, the box or other bots.
- Source: https://x.ai/news/grok-automations (how-to: https://metagrok.io/how-to/create-a-grok-automation)

### US2. Give each creative stream a Project so iteration happens in Grok, not in a bot chat
- Tag: usage saver
- Tool: Grok Projects (grok.com/project) · Cost: included
- What it does: A Project keeps its own instructions, uploaded files and chats, and each new chat inside it starts with that brief. Long prompt-tweaking sessions on lyrics, game design docs, captions or icon briefs can happen there, not in a Grok Bot chat. New angle on SG3: let a bot write the brief once, then do the day-to-day iteration in Grok.
- Steps: 1) Ask the relevant bot once for a short Project brief and reference file (style guide, palette, characters). 2) Create the Project on grok.com (not grok.x.ai, which can lack Projects). Paste the brief into the instructions field and upload the files. 3) Always start chats from inside the Project, because outside chats don't see its files. 4) Split big documents into focused files.
- Source: https://metagrok.io/how-to/create-a-grok-project (also https://docs.x.ai/grok/faq on using grok.com)

### US3. Draft-by-ramble in Grok Voice, and know Chat/Voice keep a free tier when the pool runs out
- Tag: usage saver
- Tool: Grok Voice (Grok app) · Cost: SuperGrok pool, plus a separate free tier for Chat and Voice
- What it does: Talk through a messy idea, such as a video concept, song hook or app pitch, then say "turn everything I just said into a tight brief". Paste that brief into Imagine, Build or a bot, so the bot isn't doing the brainstorming. Grok's FAQ says that after the paid weekly limit is used up, you still get Grok's free-tier Chat and Voice limits, which reset on their own schedule.
- Steps: 1) In the Grok app, tap the mic and choose Voice. 2) Say "Interview me about this idea, one question at a time, and push back where I'm vague." 3) Finish with "Turn everything I said into a one-paragraph brief plus a bullet list." 4) Check Settings → Usage for your per-product breakdown and reset time.
- Source: https://learninggpt.ai/lessons/grok/voice-modes-cloning · https://docs.x.ai/grok/faq

### US4. Ask a bot to turn any job it repeats into a script
- Tag: usage saver
- Tool: Grok Bot · Fits: Grok Bot · Effort: easy · Cost: included
- What it does: When a bot does the same steps every time (renaming files, building a list, formatting a report), a saved script gets the same result for a fraction of the usage, because the bot just runs it instead of thinking it through again.
- Steps: 1) After a task works, say "Turn this into a script on your computer and use it next time instead of redoing it by hand." 2) Ask it to note the script in the matching skill or routine.
- Source: https://x.com/GrokBotMoney/status/2109833295869718674
