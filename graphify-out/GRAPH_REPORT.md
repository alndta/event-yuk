# Graph Report - event-yuk  (2026-10-27)

## Corpus Check
- 106 files · ~533,192 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 927 nodes · 1534 edges · 56 communities (54 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.63)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `94b0d53f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- assets.mjs
- compilerOptions
- dependencies
- server.ts
- dependencies
- draw.mjs
- AuthContext.tsx
- compilerOptions
- frontend/src/types/database.types.ts
- EventItem
- inspect.mjs
- PartnerItem
- LanguageContext.tsx
- 6. Recipes
- midtrans.ts
- scenes.mjs
- charts.js
- app-draw.mjs
- Imagery
- ContractsPage.tsx
- The run
- list
- The study
- lint.mjs
- Layout
- cachedFetch
- Colour
- Scroll scenes
- App screens
- Tells — the dated registry
- Type
- achromatic-ledger
- styles
- 7. Tables and lists
- Words
- wallet
- 2. The run for an app screen
- Critique — judging the render
- workspace
- tasteskill v2 (`design-taste-frontend`)
- app.json
- 9. Type and colour
- kinds
- 3. The shell
- 4. The canvas and the page title
- 6. Charts
- 8. Forms and settings
- report
- api.ts

## God Nodes (most connected - your core abstractions)
1. `getOne()` - 32 edges
2. `useAuth()` - 31 edges
3. `search()` - 22 edges
4. `EventItem` - 20 edges
5. `getVideo()` - 19 edges
6. `6. Recipes` - 19 edges
7. `compilerOptions` - 17 edges
8. `UserRole` - 16 edges
9. `SEOHead()` - 16 edges
10. `App screens` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Props` --references--> `EventItem`  [EXTRACTED]
  frontend/src/pages/EventDetailPage.tsx → frontend/src/data/mockEvents.ts
- `Props` --references--> `PartnerItem`  [EXTRACTED]
  frontend/src/pages/PartnerDetailPage.tsx → frontend/src/data/mockPartners.ts
- `AppContent()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/App.tsx → frontend/src/context/AuthContext.tsx
- `Props` --references--> `EventItem`  [EXTRACTED]
  frontend/src/components/CreateEventModal.tsx → frontend/src/data/mockEvents.ts
- `Props` --references--> `EventItem`  [EXTRACTED]
  frontend/src/components/EventCardLive.tsx → frontend/src/data/mockEvents.ts

## Import Cycles
- None detected.

## Communities (56 total, 2 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.10
Nodes (26): App(), AppContent(), AuthPromptModal(), Props, CollaborationContract, initialContracts, Props, CreateEventModal() (+18 more)

### Community 1 - "assets.mjs"
Cohesion: 0.07
Nodes (85): AIC_FIELDS, AIC_HEADERS, applyThumb(), ARCHIVE_LICENCE, args, argv, base(), clock() (+77 more)

### Community 2 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+15 more)

### Community 3 - "dependencies"
Cohesion: 0.04
Nodes (48): dependencies, cors, dotenv, express, express-rate-limit, helmet, midtrans-client, nodemailer (+40 more)

### Community 4 - "server.ts"
Cohesion: 0.06
Nodes (37): mailer, sendEmail(), SendEmailOptions, smtpPass, supabase, options, swaggerSpec, CacheEntry (+29 more)

### Community 5 - "dependencies"
Cohesion: 0.05
Nodes (42): autoprefixer, clsx, framer-motion, dependencies, clsx, framer-motion, lucide-react, react (+34 more)

### Community 6 - "draw.mjs"
Cohesion: 0.10
Nodes (41): adjustments(), argv, assetQueries(), ASSETS_PATH, briefStop(), briefWords(), deal(), dealHero() (+33 more)

### Community 7 - "AuthContext.tsx"
Cohesion: 0.12
Nodes (21): Props, Props, RoleContextBar(), Props, RoleOption, roleOptions, UserRole, SEOHead() (+13 more)

### Community 8 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 9 - "frontend/src/types/database.types.ts"
Cohesion: 0.17
Nodes (11): supabase, CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json (+3 more)

### Community 10 - "EventItem"
Cohesion: 0.18
Nodes (13): Props, categoryLabels, EventCardLive(), Props, EventCardPortfolio(), Props, EventCardsSkeletonList(), Props (+5 more)

### Community 11 - "inspect.mjs"
Cohesion: 0.07
Nodes (29): allow, appMode, args, asJson, dealtFonts, fails, film, HEIGHT (+21 more)

### Community 12 - "PartnerItem"
Cohesion: 0.23
Nodes (8): Props, Props, PartnerCardsSkeletonList(), mockPartners, PartnerItem, Props, Props, SearchVendorsPage()

### Community 13 - "LanguageContext.tsx"
Cohesion: 0.43
Nodes (6): LanguageContext, LanguageContextType, LanguageProvider(), Language, TranslationKey, translations

### Community 14 - "6. Recipes"
Cohesion: 0.06
Nodes (31): 10. Rules for motion, 1. The budget, 2. What strong pages do with motion, 3. Four questions before any animation, 4. Tokens, 5. Scroll behaviours, ranked, 6. Recipes, 7. Signature moves (+23 more)

### Community 20 - "scenes.mjs"
Cohesion: 0.11
Nodes (15): alive(), Browser, findChrome(), Page, sleep(), sweepProfiles(), args, go() (+7 more)

### Community 21 - "charts.js"
Cohesion: 0.21
Nodes (24): axes(), bars(), dayHeads(), diverging(), frame(), hits(), kindStyle(), lane() (+16 more)

### Community 22 - "app-draw.mjs"
Cohesion: 0.12
Nodes (22): argv, deal(), dealScreen(), dealShell(), dealStyle(), fontLink(), HERE, kebab() (+14 more)

### Community 23 - "Imagery"
Cohesion: 0.09
Nodes (22): 10. Markup and credits, 11. Video, 12. Where pictures and footage go, 1. What the study measured, 2. Decide what imagery exists, 3. Real pictures from the open collections, 4. The dealt photographs, 5. Cropping and placing (+14 more)

### Community 24 - "ContractsPage.tsx"
Cohesion: 0.33
Nodes (5): ContractModal(), Props, ContractProposalItem, initialProposalsData, Props

### Community 25 - "The run"
Cohesion: 0.11
Nodes (17): 10. Report, 1. Read the brief and the project, 2. Write the argument, 3. Draw the direction, 4. Find the idea, 5. Write the words, 6. Build it, still, 7. Gate (+9 more)

### Community 26 - "list"
Cohesion: 0.24
Nodes (16): screens, screens, screens, screens, screens, screens, screens, screens (+8 more)

### Community 27 - "The study"
Cohesion: 0.12
Nodes (15): 10. The 25 highest-scored sites and their ideas, 11. How the skill was tested, 12. The October 2026 study: 100 Sites of the Day, 13. The app-screen study, 1. Method and its limits, 2. Scores, 3. Where the idea comes from, 4. Headlines (+7 more)

### Community 28 - "lint.mjs"
Cohesion: 0.16
Nodes (13): APP_LEVEL, appMode, args, asJson, byId, EXT, files, findings (+5 more)

### Community 29 - "Layout"
Cohesion: 0.15
Nodes (12): 10. How pages fail, 1. What strong pages do, 2. Margins and the grid, 3. Where text sits, 4. Empty space, 5. The frame: margins, balance and titles, 6. Sections: carry the idea, vary the arrangement, 7. Navigation (+4 more)

### Community 30 - "cachedFetch"
Cohesion: 0.15
Nodes (12): DetailSkeleton(), mockOrganizers, OrganizerItem, Props, Props, SearchBandsPage(), SearchEventsPage(), Props (+4 more)

### Community 31 - "Colour"
Cohesion: 0.17
Nodes (11): 1. What the study measured, 2. The roles, 3. Proportion, 4. Surfaces without lines or shadows, 5. Colour fields, 6. Dark pages, 7. Colour and photographs, 8. Contrast (+3 more)

### Community 32 - "Scroll scenes"
Cohesion: 0.17
Nodes (11): 1. What a scene is, 2. Putting a scene on a page, 3. Filling it, 4. Fitting it to the page, 5. The phone, reduced motion, no script, 6. Checking it, 7. Rules for scenes, 8. When no scene in the library fits (+3 more)

### Community 33 - "App screens"
Cohesion: 0.18
Nodes (10): 10. Density, 11. Empty, zero, loading and error states, 12. The phone, 13. House rules for app screens, 14. Tells of generated dashboards, 1. When this applies, 5. KPIs, App screens (+2 more)

### Community 34 - "Tells — the dated registry"
Cohesion: 0.18
Nodes (10): 1. First wave (2023–2024), 2. Second wave (2025), 3. Third wave (2025–2026): the "fix" that became the look, 4. Gallery fashion, banned as house style, 5. Structural tells, 6. Copy tells, 7. Motion tells, 8. Why removal is not enough (+2 more)

### Community 35 - "Type"
Cohesion: 0.18
Nodes (10): 1. What the study measured, 2. The scale: few sizes, far apart, 3. Setting display type, 4. Setting text, 5. Loading the fonts properly, 6. One family or two, 7. Details that separate set type from typed text, 8. Mistakes the inspector cannot see (+2 more)

### Community 36 - "achromatic-ledger"
Cohesion: 0.15
Nodes (16): note, styles, note, styles, note, styles, builder, commerce (+8 more)

### Community 37 - "styles"
Cohesion: 0.29
Nodes (7): note, styles, devtools, markets, note, styles, data-terminal

### Community 38 - "7. Tables and lists"
Cohesion: 0.20
Nodes (10): 7.1 Rows, 7.2 Header, 7.3 Dividers, 7.4 Figures and alignment, 7.5 Ink inside rows, 7.6 Status pills, 7.7 Media, 7.8 Actions and paging (+2 more)

### Community 39 - "Words"
Cohesion: 0.20
Nodes (9): 1. Write the argument first, 2. The two-line headline, 3. Headline shapes that work, 4. Supporting line, body, buttons, 5. Proof without inventing it, 6. Things that read as generated, 7. Micro-typography, Contents (+1 more)

### Community 40 - "wallet"
Cohesion: 0.50
Nodes (4): wallet, note, screens, wallet

### Community 41 - "2. The run for an app screen"
Cohesion: 0.22
Nodes (9): 2.1 Inventory the data and the jobs, 2.2 Name the screen's one question, 2.3 Choose a style, 2.4 Build the shell, 2.5 Put in the data, 2.6 Build the states, 2.7 The check, 2.8 Report (+1 more)

### Community 42 - "Critique — judging the render"
Cohesion: 0.22
Nodes (8): 1. How to look, 2. The score, 3. Caps, 4. Writing the critique, 5. What to fix first, 6. When to stop, Contents, Critique — judging the render

### Community 43 - "workspace"
Cohesion: 0.29
Nodes (7): workspace, note, screens, styles, editorial-greeting, home, inbox

### Community 44 - "tasteskill v2 (`design-taste-frontend`)"
Cohesion: 0.29
Nodes (6): Contents, How it works, Install, Notes, Requirements, tasteskill v2 (`design-taste-frontend`)

### Community 45 - "app.json"
Cohesion: 0.33
Nodes (5): about, patterns, shells, styles, version

### Community 46 - "9. Type and colour"
Cohesion: 0.33
Nodes (6): 9.1 Type, 9.2 Colour on light screens, 9.3 Colour on dark screens, 9.4 Surfaces, radius, icons, spacing, 9.5 Default tokens, 9. Type and colour

### Community 47 - "kinds"
Cohesion: 0.17
Nodes (15): note, styles, note, styles, note, styles, kinds, analytics (+7 more)

### Community 48 - "3. The shell"
Cohesion: 0.40
Nodes (5): 3.1 Five archetypes, 3.2 Sidebar, 3.3 Top bar, 3.4 Right rail and pinned columns, 3. The shell

### Community 49 - "4. The canvas and the page title"
Cohesion: 0.40
Nodes (5): 4.1 Width and gutters, 4.2 One left edge, one right edge, 4.3 The title, 4.4 Tabs, filters and the date range, 4. The canvas and the page title

### Community 50 - "6. Charts"
Cohesion: 0.40
Nodes (5): 6.1 Which chart for which question, 6.2 One question, one series, 6.3 Axes and gridlines, 6.4 Marks, 6. Charts

### Community 52 - "8. Forms and settings"
Cohesion: 0.50
Nodes (4): 8.1 Fields, 8.2 Settings layout, 8.3 Buttons, 8. Forms and settings

### Community 54 - "report"
Cohesion: 0.40
Nodes (5): report, note, screens, styles, report

## Knowledge Gaps
- **406 isolated node(s):** `version`, `about`, `styles`, `shells`, `patterns` (+401 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `kinds` connect `kinds` to `achromatic-ledger`, `styles`, `wallet`, `workspace`, `app.json`, `report`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `App screens` connect `App screens` to `7. Tables and lists`, `2. The run for an app screen`, `9. Type and colour`, `3. The shell`, `4. The canvas and the page title`, `6. Charts`, `8. Forms and settings`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `search()` (e.g. with `searchAic()` and `searchArchive()`) actually correct?**
  _`search()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `version`, `about`, `styles` to the rest of the system?**
  _406 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1006006006006006 - nodes in this community are weakly interconnected._
- **Should `assets.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.06730506155950752 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._