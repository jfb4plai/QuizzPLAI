# QuizzPLAI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build QuizzPLAI, a live no-competition quiz tool (host presents on a projector, teachers vote anonymously from their phone via QR code, results collected as session history).

**Architecture:** React 18 + Vite 5 SPA, Supabase (auth for host agents, Postgres for `quizz_sessions`/`quizz_responses`, Realtime on Postgres Changes to sync question progress and live vote counts — no separate broadcast channel). Deployed to Vercel. No serverless functions in this lot.

**Tech Stack:** React 18, Vite 5, react-router-dom 6, Tailwind CSS v3, @supabase/supabase-js v2, qrcode, Vitest.

Spec: `docs/superpowers/specs/2026-08-24-quizzplai-design.md`

---

## Task 1: Scaffold project & tooling

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/main.jsx` (placeholder, replaced in Task 7)
- Create: `src/plai-style.css` (copied)
- Create: `public/plai-logo.jpg` (copied)

- [ ] **Step 1: Copy the shared PLAI CSS and logo**

```bash
cp "C:/Users/jfbeg/OneDrive/claude-workspace/shared/css/plai-style.css" "C:/Users/jfbeg/OneDrive/claude-workspace/quizzplai/src/plai-style.css"
mkdir -p "C:/Users/jfbeg/OneDrive/claude-workspace/quizzplai/public"
cp "C:/Users/jfbeg/OneDrive/claude-workspace/projets/portail-plai/public/plai-logo.jpg" "C:/Users/jfbeg/OneDrive/claude-workspace/quizzplai/public/plai-logo.jpg"
```

If either source path doesn't exist, stop and ask the user for the correct path — do not fabricate a placeholder CSS file or logo.

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "quizzplai",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "qrcode": "^1.5.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.7",
    "vite": "^5.3.4",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 3: Write `vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
});
```

- [ ] **Step 4: Write `tailwind.config.js` (ESM-safe, per project CLAUDE.md fix)**

```js
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{js,jsx}'),
  ],
  theme: { extend: {} },
  plugins: [],
};
```

- [ ] **Step 5: Write `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Write `index.html`**

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>QuizzPLAI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Write `.gitignore`**

```
node_modules/
dist/
.env
.env.local
```

- [ ] **Step 8: Write `.env.example`**

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- [ ] **Step 9: Write a placeholder `src/main.jsx` so `npm run dev` boots**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './plai-style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="plai-section">QuizzPLAI — en construction</div>
  </React.StrictMode>
);
```

- [ ] **Step 10: Install dependencies**

```bash
cd "C:/Users/jfbeg/OneDrive/claude-workspace/quizzplai" && npm install
```

- [ ] **Step 11: Verify the dev server boots**

Run: `npx vite build`
Expected: build succeeds with no errors (per project CLAUDE.md: build must pass locally before any push).

- [ ] **Step 12: Commit**

```bash
git add package.json vite.config.js tailwind.config.js postcss.config.js index.html .gitignore .env.example src/main.jsx src/plai-style.css public/plai-logo.jpg
git commit -m "chore: scaffold QuizzPLAI (Vite + React + Tailwind + PLAI CSS)"
```

---

## Task 2: `lib/sessionCode.js` — session code generation (TDD)

Session codes are short (6 chars), uppercase, and exclude visually ambiguous characters (`0/O`, `1/I`) since agents will read them aloud or teachers may type them.

**Files:**
- Create: `src/lib/sessionCode.js`
- Test: `src/lib/sessionCode.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';
import { generateSessionCode, isValidSessionCode } from './sessionCode';

describe('generateSessionCode', () => {
  it('generates a 6-character uppercase code', () => {
    const code = generateSessionCode();
    expect(code).toHaveLength(6);
    expect(code).toBe(code.toUpperCase());
  });

  it('never contains ambiguous characters 0, O, 1, I', () => {
    for (let i = 0; i < 200; i++) {
      const code = generateSessionCode();
      expect(code).not.toMatch(/[01OI]/);
    }
  });

  it('generates different codes across calls (extremely unlikely collision)', () => {
    const codes = new Set();
    for (let i = 0; i < 50; i++) codes.add(generateSessionCode());
    expect(codes.size).toBe(50);
  });
});

describe('isValidSessionCode', () => {
  it('accepts a well-formed code', () => {
    expect(isValidSessionCode('ABCDEF')).toBe(true);
  });

  it('rejects wrong length', () => {
    expect(isValidSessionCode('ABC')).toBe(false);
  });

  it('rejects lowercase', () => {
    expect(isValidSessionCode('abcdef')).toBe(false);
  });

  it('rejects ambiguous characters', () => {
    expect(isValidSessionCode('ABC0EF')).toBe(false);
    expect(isValidSessionCode('ABC1EF')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/sessionCode.test.js`
Expected: FAIL — `Cannot find module './sessionCode'`

- [ ] **Step 3: Write the implementation**

```js
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
const CODE_LENGTH = 6;

export function generateSessionCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export function isValidSessionCode(code) {
  if (typeof code !== 'string' || code.length !== CODE_LENGTH) return false;
  const pattern = new RegExp(`^[${ALPHABET}]{${CODE_LENGTH}}$`);
  return pattern.test(code);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/sessionCode.test.js`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/sessionCode.js src/lib/sessionCode.test.js
git commit -m "feat: session code generation and validation"
```

---

## Task 3: `lib/voteTally.js` — aggregate votes (TDD)

**Files:**
- Create: `src/lib/voteTally.js`
- Test: `src/lib/voteTally.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest';
import { countVotes } from './voteTally';

describe('countVotes', () => {
  it('counts votes per option for a given question', () => {
    const responses = [
      { question_index: 0, choice: 0 },
      { question_index: 0, choice: 0 },
      { question_index: 0, choice: 2 },
      { question_index: 1, choice: 1 },
    ];
    expect(countVotes(responses, 0, 3)).toEqual([2, 0, 1]);
  });

  it('returns zeros when there are no responses for that question', () => {
    expect(countVotes([], 0, 3)).toEqual([0, 0, 0]);
  });

  it('ignores responses for other questions', () => {
    const responses = [{ question_index: 5, choice: 1 }];
    expect(countVotes(responses, 0, 3)).toEqual([0, 0, 0]);
  });

  it('ignores out-of-range choice values defensively', () => {
    const responses = [{ question_index: 0, choice: 99 }];
    expect(countVotes(responses, 0, 3)).toEqual([0, 0, 0]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/voteTally.test.js`
Expected: FAIL — `Cannot find module './voteTally'`

- [ ] **Step 3: Write the implementation**

```js
export function countVotes(responses, questionIndex, numOptions) {
  const counts = new Array(numOptions).fill(0);
  for (const r of responses) {
    if (r.question_index !== questionIndex) continue;
    if (r.choice < 0 || r.choice >= numOptions) continue;
    counts[r.choice] += 1;
  }
  return counts;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/voteTally.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/voteTally.js src/lib/voteTally.test.js
git commit -m "feat: vote tally aggregation"
```

---

## Task 4: Question sets — JSON content + `lib/questionSets.js` (TDD)

Question sets are versioned JSON files under `src/question-sets/`, loaded at build time via Vite's `import.meta.glob`. `reponses_possibles` is fixed at exactly 3 options (per spec — 3-answer format).

**Files:**
- Create: `src/question-sets/plai-missions-chaudfontaine.json`
- Create: `src/lib/questionSets.js`
- Test: `src/lib/questionSets.test.js`

- [ ] **Step 1: Write the Chaudfontaine example question set**

Content extracted from `Quizz de rentrée Chaudfontaine.docx` (9 situations, 3 fixed answers: oui / non / oui à certaines conditions):

```json
{
  "id": "plai-missions-chaudfontaine",
  "titre": "Le pôle peut-il intervenir ? Si oui, comment ?",
  "reponses_possibles": ["Oui", "Non", "Oui, à certaines conditions"],
  "questions": [
    {
      "situation": "Nous sommes en début d'année : je découvre une classe composée d'élèves à profils variés et je souhaiterais bénéficier d'un regard extérieur sur mes pratiques.",
      "bonne_reponse": 0,
      "explication": "Soutien à l'équipe. Attention : objectif pratiques inclusives et mise en place d'AU."
    },
    {
      "situation": "Un enfant de ma classe a été bilanté par un neuropsychologue : les parents fournissent le bilan et demandent que les aménagements proposés par le spécialiste soient mis en place.",
      "bonne_reponse": 0,
      "explication": "Accompagnement à la mise en place d'un PAR. Attention : observation et réflexion préalable en vue de sélectionner les AR pertinents + réunion pour formaliser le PAR."
    },
    {
      "situation": "J'ai un élève dans ma classe qui rencontre des difficultés, il est perdu dès qu'on mélange les types d'exercices. Un bilan logopédique a été réalisé, un protocole d'aménagements raisonnables a été formalisé mais l'élève ne semble pas progresser. Les parents n'ont pas demandé de revoir le protocole.",
      "bonne_reponse": 0,
      "explication": "Mission individuelle ou soutien aux équipes selon le contexte."
    },
    {
      "situation": "Un enfant présente des difficultés scolaires importantes mais aucun spécialiste n'a été consulté. Le CPMS a été recommandé à la famille.",
      "bonne_reponse": 0,
      "explication": "Accompagnement à la mise en place d'un PAR SI autorisation parentale et diagnostic fonctionnel CPMS (demandé par la famille ET donné à la famille), OU soutien à l'enseignante sans intervention en classe."
    },
    {
      "situation": "Avec mes collègues nous aimerions changer de méthode de lecture, les avis sont partagés entre plusieurs manuels disponibles.",
      "bonne_reponse": 0,
      "explication": "Soutien à l'équipe : participer à une concertation en apportant des éléments en lien avec les AU et le développement de l'enfant. Le pôle ne peut jamais conseiller un manuel en particulier."
    },
    {
      "situation": "J'ai dans ma classe de 6e plusieurs élèves à besoins spécifiques pour qui un accompagnement individuel durant les épreuves du CEB serait opportun.",
      "bonne_reponse": 0,
      "explication": "Accompagnement d'élèves sous PAR. Attention : aménagements mis en place pendant l'année, de préférence formalisés dans un PAR."
    },
    {
      "situation": "J'ai dans ma classe de maternelles un(e) élève au comportement violent.",
      "bonne_reponse": 0,
      "explication": "Soutien à l'enseignant + accompagnement d'élève si diagnostic et en collaboration avec le CPMS. Cellule maternelle."
    },
    {
      "situation": "Je suis institutrice, je suis aux urgences avec mon enfant. Il était prévu que l'agent du Pôle accompagne ce matin deux élèves dans ma classe. Je le préviens avant 8h15 de mon absence et lui dis qu'il peut rester avec mes élèves le temps que j'arrive.",
      "bonne_reponse": 1,
      "explication": "Pas d'accompagnement en classe sans enseignant présent."
    },
    {
      "situation": "Un parent d'un élève de ma classe a contacté l'agent du PLAI pour demander que des aménagements soient mis en place pour son enfant.",
      "bonne_reponse": 1,
      "explication": "Pas d'intervention sans demande de l'école."
    }
  ]
}
```

- [ ] **Step 2: Write the registry**

```json
[
  { "id": "plai-missions-chaudfontaine", "fichier": "plai-missions-chaudfontaine.json" }
]
```

Save as `src/question-sets/index.json`.

- [ ] **Step 3: Write the failing test for the loader/validator**

```js
import { describe, it, expect } from 'vitest';
import { validateQuestionSet, loadQuestionSets, getQuestionSet } from './questionSets';

const validSet = {
  id: 'demo',
  titre: 'Titre',
  reponses_possibles: ['A', 'B', 'C'],
  questions: [{ situation: 'Une situation', bonne_reponse: 0, explication: 'Car oui' }],
};

describe('validateQuestionSet', () => {
  it('accepts a well-formed question set', () => {
    expect(() => validateQuestionSet(validSet)).not.toThrow();
  });

  it('rejects a set without exactly 3 reponses_possibles', () => {
    const bad = { ...validSet, reponses_possibles: ['A', 'B'] };
    expect(() => validateQuestionSet(bad)).toThrow(/reponses_possibles/);
  });

  it('rejects a set with no questions', () => {
    const bad = { ...validSet, questions: [] };
    expect(() => validateQuestionSet(bad)).toThrow(/questions/);
  });

  it('rejects a question whose bonne_reponse is out of range', () => {
    const bad = {
      ...validSet,
      questions: [{ situation: 'X', bonne_reponse: 5, explication: 'Y' }],
    };
    expect(() => validateQuestionSet(bad)).toThrow(/bonne_reponse/);
  });

  it('rejects a question missing a situation', () => {
    const bad = { ...validSet, questions: [{ bonne_reponse: 0, explication: 'Y' }] };
    expect(() => validateQuestionSet(bad)).toThrow(/situation/);
  });
});

describe('loadQuestionSets / getQuestionSet', () => {
  it('loads the Chaudfontaine example set from the registry', () => {
    const sets = loadQuestionSets();
    expect(sets['plai-missions-chaudfontaine']).toBeDefined();
    expect(sets['plai-missions-chaudfontaine'].questions).toHaveLength(9);
  });

  it('getQuestionSet returns the same set by id', () => {
    const set = getQuestionSet('plai-missions-chaudfontaine');
    expect(set.titre).toMatch(/pôle/);
  });

  it('getQuestionSet throws for an unknown id', () => {
    expect(() => getQuestionSet('does-not-exist')).toThrow(/does-not-exist/);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run src/lib/questionSets.test.js`
Expected: FAIL — `Cannot find module './questionSets'`

- [ ] **Step 5: Write the implementation**

```js
export function validateQuestionSet(set) {
  if (!Array.isArray(set.reponses_possibles) || set.reponses_possibles.length !== 3) {
    throw new Error(`reponses_possibles doit contenir exactement 3 réponses (set "${set.id}")`);
  }
  if (!Array.isArray(set.questions) || set.questions.length === 0) {
    throw new Error(`questions ne peut pas être vide (set "${set.id}")`);
  }
  set.questions.forEach((q, i) => {
    if (!q.situation || typeof q.situation !== 'string') {
      throw new Error(`question ${i} : situation manquante ou invalide (set "${set.id}")`);
    }
    if (
      typeof q.bonne_reponse !== 'number' ||
      q.bonne_reponse < 0 ||
      q.bonne_reponse >= set.reponses_possibles.length
    ) {
      throw new Error(`question ${i} : bonne_reponse hors limites (set "${set.id}")`);
    }
  });
  return set;
}

const modules = import.meta.glob('./question-sets/*.json', { eager: true });

function fileNameToKey(path) {
  return path.split('/').pop();
}

export function loadQuestionSets() {
  const byFile = {};
  for (const [path, mod] of Object.entries(modules)) {
    byFile[fileNameToKey(path)] = mod.default ?? mod;
  }

  const registry = byFile['index.json'];
  const sets = {};
  for (const entry of registry) {
    const raw = byFile[entry.fichier];
    if (!raw) {
      throw new Error(`Jeu de questions introuvable pour l'entrée de registre "${entry.id}" (fichier ${entry.fichier})`);
    }
    sets[entry.id] = validateQuestionSet(raw);
  }
  return sets;
}

export function getQuestionSet(id) {
  const sets = loadQuestionSets();
  const set = sets[id];
  if (!set) throw new Error(`Jeu de questions inconnu : ${id}`);
  return set;
}
```

Note: the glob pattern `./question-sets/*.json` is relative to `src/lib/questionSets.js`, so it must live one level up from where this file sits — the file paths above already place `questionSets.js` at `src/lib/` and the JSON at `src/question-sets/`, which do not share a parent this way. Fix the glob to `'../question-sets/*.json'` instead.

- [ ] **Step 6: Fix the glob path**

In `src/lib/questionSets.js`, change:

```js
const modules = import.meta.glob('./question-sets/*.json', { eager: true });
```

to:

```js
const modules = import.meta.glob('../question-sets/*.json', { eager: true });
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run src/lib/questionSets.test.js`
Expected: PASS (8 tests)

- [ ] **Step 8: Commit**

```bash
git add src/question-sets/ src/lib/questionSets.js src/lib/questionSets.test.js
git commit -m "feat: question set schema, loader, and Chaudfontaine example set"
```

---

## Task 5: Supabase schema + client

Deviation from spec worth noting: the spec floated an aggregated view (`quizz_responses_counts`) to avoid exposing raw response rows publicly. In practice only the session's owner ever reads `quizz_responses` (participants only INSERT, never SELECT), and RLS already restricts SELECT to the owner — so the view would add a moving part with no security benefit. Implemented here as owner-only SELECT on the raw table instead.

**Files:**
- Create: `supabase/schema.sql`
- Create: `src/supabaseClient.js`

- [ ] **Step 1: Write the schema**

```sql
-- QuizzPLAI schema. Run in the Supabase SQL editor for project dfoaumjleqtxjeaplnna.
-- Reuses the shared `profiles` table and `updated_at` trigger already present in that project.
-- Do not recreate them here.

create table if not exists quizz_sessions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom text not null,
  date_session date not null default current_date,
  question_set_id text not null,
  current_question_index int not null default -1,
  revealed boolean not null default false,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'en_cours', 'terminee')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists quizz_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references quizz_sessions(id) on delete cascade,
  question_index int not null,
  choice int not null check (choice in (0, 1, 2)),
  created_at timestamptz not null default now()
);

create index if not exists quizz_responses_session_question_idx
  on quizz_responses (session_id, question_index);

alter table quizz_sessions enable row level security;
alter table quizz_responses enable row level security;

-- Sessions: readable by anyone (no PII in this table — needed so unauthenticated
-- participants can follow session progress via /join/:code).
create policy "quizz_sessions_public_read" on quizz_sessions
  for select using (true);

create policy "quizz_sessions_owner_insert" on quizz_sessions
  for insert with check (auth.uid() = created_by);

create policy "quizz_sessions_owner_update" on quizz_sessions
  for update using (auth.uid() = created_by);

-- Responses: anyone (including anonymous participants) can insert a vote.
-- Only the session's owner can read the raw responses.
create policy "quizz_responses_anon_insert" on quizz_responses
  for insert with check (true);

create policy "quizz_responses_owner_read" on quizz_responses
  for select using (
    exists (
      select 1 from quizz_sessions s
      where s.id = quizz_responses.session_id
      and s.created_by = auth.uid()
    )
  );

-- Enable Realtime (Postgres Changes) on both tables.
alter publication supabase_realtime add table quizz_sessions;
alter publication supabase_realtime add table quizz_responses;
```

- [ ] **Step 2: Run the schema against the shared Supabase project**

Open the Supabase SQL editor for project `dfoaumjleqtxjeaplnna`, paste `supabase/schema.sql`, and run it. Confirm both tables appear under Table Editor and RLS shows as enabled.

- [ ] **Step 3: Write `src/supabaseClient.js`**

```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être définis (.env.local)');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 4: Create a local `.env.local` (not committed) with the shared project's credentials**

```bash
cp .env.example .env.local
```

Fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the Supabase dashboard (Project Settings → API) for project `dfoaumjleqtxjeaplnna`. Never commit this file — it's already in `.gitignore`.

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql src/supabaseClient.js
git commit -m "feat: Supabase schema (quizz_sessions, quizz_responses) and client"
```

---

## Task 6: Auth — `AuthContext` + Login page

**Files:**
- Create: `src/contexts/AuthContext.jsx`
- Create: `src/pages/Login.jsx`

- [ ] **Step 1: Write `AuthContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider');
  return ctx;
}
```

- [ ] **Step 2: Write `Login.jsx`**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError) {
      setError('Connexion impossible. Vérifiez votre adresse et votre mot de passe.');
      return;
    }
    navigate('/host/dashboard');
  }

  return (
    <div className="plai-section">
      <form className="plai-card" onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h1>Connexion agent du pôle</h1>
        <label htmlFor="email">Adresse e-mail</label>
        <input
          id="email"
          className="plai-input"
          type="email"
          placeholder="prenom.nom@ens.ecl.be"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <p style={{ fontSize: '0.85rem' }}>Utilisée uniquement pour identifier l'agent créant la session.</p>

        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          className="plai-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="plai-error">{error}</p>}

        <button className="plai-btn" type="submit" disabled={submitting}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/contexts/AuthContext.jsx src/pages/Login.jsx
git commit -m "feat: agent authentication (AuthContext + Login page)"
```

---

## Task 7: Shell — Nav, Footer, main.jsx, minimal App.jsx

**Files:**
- Create: `src/components/Nav.jsx`
- Create: `src/components/Footer.jsx`
- Modify: `src/main.jsx`
- Create: `src/App.jsx`

- [ ] **Step 1: Write `Nav.jsx`**

```jsx
export function Nav() {
  return (
    <nav className="plai-nav">
      <img src="/plai-logo.jpg" alt="Logo PLAI" width={32} height={32} />
      <span>QuizzPLAI</span>
    </nav>
  );
}
```

- [ ] **Step 2: Write `Footer.jsx`**

```jsx
export function Footer() {
  return (
    <footer className="plai-footer">
      <img src="/plai-logo.jpg" alt="Logo PLAI" width={40} height={40} />
      <span>Pôle Liégeois d'Accompagnement vers une École Inclusive</span>
    </footer>
  );
}
```

- [ ] **Step 3: Rewrite `main.jsx`**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { App } from './App';
import './plai-style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 4: Write a minimal `App.jsx` (routes finalized in Task 14)**

```jsx
import { Routes, Route } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Login } from './pages/Login';

export function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<div className="plai-section">QuizzPLAI — en construction</div>} />
      </Routes>
      <Footer />
    </>
  );
}
```

- [ ] **Step 5: Verify the build still passes**

Run: `npx vite build`
Expected: build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/Nav.jsx src/components/Footer.jsx src/main.jsx src/App.jsx
git commit -m "feat: app shell (Nav, Footer, routing skeleton)"
```

---

## Task 8: UI components — QRCodeBlock, QuestionDisplay, ResultBars, AnswerButtons

**Files:**
- Create: `src/components/QRCodeBlock.jsx`
- Create: `src/components/QuestionDisplay.jsx`
- Create: `src/components/ResultBars.jsx`
- Create: `src/components/AnswerButtons.jsx`

- [ ] **Step 1: Write `QRCodeBlock.jsx`**

```jsx
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function QRCodeBlock({ url }) {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, {
      width: 240,
      margin: 1,
      color: { dark: '#0a9370', light: '#ffffff' },
    }).then((data) => {
      if (!cancelled) setDataUrl(data);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!dataUrl) {
    return <div className="plai-empty">Génération du QR code…</div>;
  }

  return (
    <div className="plai-card" style={{ textAlign: 'center' }}>
      <img src={dataUrl} alt={`QR code pour rejoindre la session : ${url}`} width={240} height={240} />
      <p style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '1.1rem' }}>{url}</p>
    </div>
  );
}
```

- [ ] **Step 2: Write `QuestionDisplay.jsx`**

```jsx
export function QuestionDisplay({ questionIndex, totalQuestions, situation }) {
  return (
    <div className="plai-card">
      <p style={{ fontSize: '0.9rem', color: 'var(--text2)' }}>
        Question {questionIndex + 1} / {totalQuestions}
      </p>
      <p style={{ fontSize: '1.4rem', lineHeight: '1.5' }}>{situation}</p>
    </div>
  );
}
```

- [ ] **Step 3: Write `ResultBars.jsx`**

```jsx
const LABELS = ['A', 'B', 'C'];

export function ResultBars({ options, counts, revealed, correctIndex }) {
  const total = counts.reduce((sum, c) => sum + c, 0);

  return (
    <div className="plai-card">
      {options.map((option, i) => {
        const pct = total === 0 ? 0 : Math.round((counts[i] / total) * 100);
        const isCorrect = revealed && correctIndex === i;
        return (
          <div key={i} style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                <strong>{LABELS[i]}.</strong> {option}
                {isCorrect && <span className="plai-success"> — bonne réponse</span>}
              </span>
              <span>{counts[i]} ({pct}%)</span>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: '4px', height: '12px' }}>
              <div
                style={{
                  width: `${pct}%`,
                  background: isCorrect ? '#0a9370' : '#f97316',
                  height: '100%',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        );
      })}
      <p style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>{total} réponse{total !== 1 ? 's' : ''}</p>
    </div>
  );
}
```

- [ ] **Step 4: Write `AnswerButtons.jsx`**

```jsx
const LABELS = ['A', 'B', 'C'];

export function AnswerButtons({ options, onVote, disabled }) {
  return (
    <div className="plai-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {options.map((option, i) => (
        <button
          key={i}
          type="button"
          className="plai-btn"
          style={{ minHeight: '44px', fontSize: '1.1rem', textAlign: 'left' }}
          disabled={disabled}
          onClick={() => onVote(i)}
        >
          <strong>{LABELS[i]}.</strong> {option}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/QRCodeBlock.jsx src/components/QuestionDisplay.jsx src/components/ResultBars.jsx src/components/AnswerButtons.jsx
git commit -m "feat: presentation and voting UI components"
```

---

## Task 9: Realtime hooks

**Files:**
- Create: `src/hooks/useSessionRealtime.js`
- Create: `src/hooks/useResponseCounts.js`

- [ ] **Step 1: Write `useSessionRealtime.js`**

Fetches a session by id (or by code) and keeps it live-updated via Postgres Changes on `UPDATE`.

```js
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function useSessionRealtime(sessionId) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    async function fetchSession() {
      const { data, error: fetchError } = await supabase
        .from('quizz_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      if (cancelled) return;
      if (fetchError) {
        setError(fetchError);
      } else {
        setSession(data);
      }
      setLoading(false);
    }

    fetchSession();

    const channel = supabase
      .channel(`quizz_sessions_${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'quizz_sessions', filter: `id=eq.${sessionId}` },
        (payload) => {
          if (!cancelled) setSession(payload.new);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { session, loading, error };
}
```

- [ ] **Step 2: Write `useResponseCounts.js`**

Refetches all responses for the current question whenever a new one is inserted — simplest correct approach given the small audience size (a few dozen teachers per session).

```js
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { countVotes } from '../lib/voteTally';

export function useResponseCounts(sessionId, questionIndex, numOptions) {
  const [counts, setCounts] = useState(new Array(numOptions).fill(0));

  useEffect(() => {
    if (!sessionId || questionIndex == null || questionIndex < 0) return;
    let cancelled = false;

    async function fetchCounts() {
      const { data, error } = await supabase
        .from('quizz_responses')
        .select('question_index, choice')
        .eq('session_id', sessionId)
        .eq('question_index', questionIndex);
      if (!cancelled && !error) {
        setCounts(countVotes(data, questionIndex, numOptions));
      }
    }

    fetchCounts();

    const channel = supabase
      .channel(`quizz_responses_${sessionId}_${questionIndex}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quizz_responses',
          filter: `session_id=eq.${sessionId}`,
        },
        () => fetchCounts()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [sessionId, questionIndex, numOptions]);

  return counts;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useSessionRealtime.js src/hooks/useResponseCounts.js
git commit -m "feat: realtime hooks for session progress and vote counts"
```

---

## Task 10: Host — New Session page

**Files:**
- Create: `src/pages/HostNewSession.jsx`

- [ ] **Step 1: Write `HostNewSession.jsx`**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { generateSessionCode } from '../lib/sessionCode';
import { loadQuestionSets } from '../lib/questionSets';

const MAX_ATTEMPTS = 5;

export function HostNewSession() {
  const { session: authSession } = useAuth();
  const questionSets = loadQuestionSets();
  const setIds = Object.keys(questionSets);

  const [nom, setNom] = useState('');
  const [dateSession, setDateSession] = useState(() => new Date().toISOString().slice(0, 10));
  const [questionSetId, setQuestionSetId] = useState(setIds[0] ?? '');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const code = generateSessionCode();
      const { data, error: insertError } = await supabase
        .from('quizz_sessions')
        .insert({
          code,
          nom,
          date_session: dateSession,
          question_set_id: questionSetId,
          created_by: authSession.user.id,
        })
        .select()
        .single();

      if (!insertError) {
        navigate(`/host/session/${data.id}`);
        return;
      }
      // Unique violation on `code` — retry with a new code. Any other error, stop.
      if (insertError.code !== '23505') {
        setError("Impossible de créer la session. Réessayez.");
        setSubmitting(false);
        return;
      }
    }
    setError('Impossible de générer un code de session unique. Réessayez.');
    setSubmitting(false);
  }

  return (
    <div className="plai-section">
      <form className="plai-card" onSubmit={handleSubmit} style={{ maxWidth: '480px', margin: '0 auto' }}>
        <h1>Nouvelle session</h1>

        <label htmlFor="nom">Nom de la session</label>
        <input
          id="nom"
          className="plai-input"
          type="text"
          placeholder="École de Chaudfontaine"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />
        <p style={{ fontSize: '0.85rem' }}>Sert à retrouver cette présentation dans le tableau de bord (école, contexte).</p>

        <label htmlFor="date">Date</label>
        <input
          id="date"
          className="plai-input"
          type="date"
          value={dateSession}
          onChange={(e) => setDateSession(e.target.value)}
          required
        />

        <label htmlFor="questionSet">Jeu de questions</label>
        <select
          id="questionSet"
          className="plai-input"
          value={questionSetId}
          onChange={(e) => setQuestionSetId(e.target.value)}
        >
          {setIds.map((id) => (
            <option key={id} value={id}>
              {questionSets[id].titre}
            </option>
          ))}
        </select>
        <p style={{ fontSize: '0.85rem' }}>Détermine les questions et les 3 réponses proposées durant toute la session.</p>

        {error && <p className="plai-error">{error}</p>}

        <button className="plai-btn" type="submit" disabled={submitting || setIds.length === 0}>
          {submitting ? 'Création…' : 'Créer la session'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/HostNewSession.jsx
git commit -m "feat: host new session page"
```

---

## Task 11: Host — Session (presentation) page

Handles both the live-running session (host controls) and a finished session viewed from history (read-only).

**Files:**
- Create: `src/pages/HostSession.jsx`

- [ ] **Step 1: Write `HostSession.jsx`**

```jsx
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useSessionRealtime } from '../hooks/useSessionRealtime';
import { useResponseCounts } from '../hooks/useResponseCounts';
import { getQuestionSet } from '../lib/questionSets';
import { QRCodeBlock } from '../components/QRCodeBlock';
import { QuestionDisplay } from '../components/QuestionDisplay';
import { ResultBars } from '../components/ResultBars';

export function HostSession() {
  const { id } = useParams();
  const { session, loading, error } = useSessionRealtime(id);

  if (loading) return <div className="plai-section">Chargement…</div>;
  if (error || !session) return <div className="plai-section plai-error">Session introuvable.</div>;

  const questionSet = getQuestionSet(session.question_set_id);
  const joinUrl = `${window.location.origin}/join/${session.code}`;

  async function startSession() {
    await supabase
      .from('quizz_sessions')
      .update({ current_question_index: 0, statut: 'en_cours' })
      .eq('id', session.id);
  }

  async function reveal() {
    await supabase.from('quizz_sessions').update({ revealed: true }).eq('id', session.id);
  }

  async function nextQuestion() {
    const nextIndex = session.current_question_index + 1;
    if (nextIndex >= questionSet.questions.length) {
      await supabase.from('quizz_sessions').update({ statut: 'terminee' }).eq('id', session.id);
    } else {
      await supabase
        .from('quizz_sessions')
        .update({ current_question_index: nextIndex, revealed: false })
        .eq('id', session.id);
    }
  }

  async function endSession() {
    await supabase.from('quizz_sessions').update({ statut: 'terminee' }).eq('id', session.id);
  }

  if (session.statut === 'en_attente') {
    return (
      <div className="plai-section">
        <h1>{session.nom}</h1>
        <QRCodeBlock url={joinUrl} />
        <p>Code de session : <strong>{session.code}</strong></p>
        <button className="plai-btn" type="button" onClick={startSession}>
          Démarrer la session
        </button>
      </div>
    );
  }

  const currentQuestion = questionSet.questions[session.current_question_index];
  const isLive = session.statut === 'en_cours';

  return (
    <div className="plai-section">
      <h1>{session.nom}</h1>
      {isLive && <QRCodeBlock url={joinUrl} />}
      <QuestionDisplay
        questionIndex={session.current_question_index}
        totalQuestions={questionSet.questions.length}
        situation={currentQuestion.situation}
      />
      <LiveResults
        sessionId={session.id}
        questionIndex={session.current_question_index}
        options={questionSet.reponses_possibles}
        revealed={session.revealed}
        correctIndex={currentQuestion.bonne_reponse}
      />
      {session.revealed && <p className="plai-card">{currentQuestion.explication}</p>}

      {isLive && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!session.revealed && (
            <button className="plai-btn" type="button" onClick={reveal}>
              Révéler la réponse
            </button>
          )}
          <button className="plai-btn" type="button" onClick={nextQuestion}>
            Question suivante
          </button>
          <button className="plai-btn" type="button" onClick={endSession}>
            Terminer la session
          </button>
        </div>
      )}
    </div>
  );
}

function LiveResults({ sessionId, questionIndex, options, revealed, correctIndex }) {
  const counts = useResponseCounts(sessionId, questionIndex, options.length);
  return <ResultBars options={options} counts={counts} revealed={revealed} correctIndex={correctIndex} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/HostSession.jsx
git commit -m "feat: host presentation page (live control + read-only history view)"
```

---

## Task 12: Host — Dashboard page

**Files:**
- Create: `src/pages/HostDashboard.jsx`

- [ ] **Step 1: Write `HostDashboard.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export function HostDashboard() {
  const { session: authSession } = useAuth();
  const [sessions, setSessions] = useState(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('quizz_sessions')
      .select('*')
      .eq('created_by', authSession.user.id)
      .order('date_session', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) setSessions(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [authSession.user.id]);

  return (
    <div className="plai-section">
      <h1>Mes sessions</h1>
      <Link className="plai-btn" to="/host/new">
        Nouvelle session
      </Link>

      {sessions === null && <p>Chargement…</p>}
      {sessions?.length === 0 && <p className="plai-empty">Aucune session pour l'instant.</p>}

      {sessions?.map((s) => (
        <Link key={s.id} to={`/host/session/${s.id}`} className="plai-card" style={{ display: 'block', marginTop: '0.75rem' }}>
          <strong>{s.nom}</strong> — {s.date_session} — {s.statut}
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/HostDashboard.jsx
git commit -m "feat: host dashboard (session history)"
```

---

## Task 13: Join page (participant)

**Files:**
- Create: `src/pages/Join.jsx`

- [ ] **Step 1: Write `Join.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useSessionRealtime } from '../hooks/useSessionRealtime';
import { getQuestionSet } from '../lib/questionSets';
import { isValidSessionCode } from '../lib/sessionCode';
import { QuestionDisplay } from '../components/QuestionDisplay';
import { AnswerButtons } from '../components/AnswerButtons';

function votedKey(sessionId, questionIndex) {
  return `quizz_voted_${sessionId}_${questionIndex}`;
}

export function Join() {
  const { code } = useParams();
  const [sessionId, setSessionId] = useState(null);
  const [lookupError, setLookupError] = useState(null);
  const normalizedCode = code.toUpperCase();

  useEffect(() => {
    if (!isValidSessionCode(normalizedCode)) {
      setLookupError(true);
      return;
    }
    let cancelled = false;
    supabase
      .from('quizz_sessions')
      .select('id')
      .eq('code', normalizedCode)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setLookupError(true);
        } else {
          setSessionId(data.id);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [normalizedCode]);

  if (lookupError) {
    return <div className="plai-section plai-error">Code de session inconnu : {code}</div>;
  }
  if (!sessionId) {
    return <div className="plai-section">Recherche de la session…</div>;
  }

  return <JoinedSession sessionId={sessionId} />;
}

function JoinedSession({ sessionId }) {
  const { session, loading } = useSessionRealtime(sessionId);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    if (!session) return;
    setVoted(!!sessionStorage.getItem(votedKey(session.id, session.current_question_index)));
  }, [session?.id, session?.current_question_index]);

  if (loading || !session) return <div className="plai-section">Chargement…</div>;

  if (session.statut === 'en_attente') {
    return <div className="plai-section">La session va commencer…</div>;
  }
  if (session.statut === 'terminee') {
    return <div className="plai-section">Merci pour votre participation !</div>;
  }

  const questionSet = getQuestionSet(session.question_set_id);
  const currentQuestion = questionSet.questions[session.current_question_index];

  async function handleVote(choice) {
    await supabase.from('quizz_responses').insert({
      session_id: session.id,
      question_index: session.current_question_index,
      choice,
    });
    sessionStorage.setItem(votedKey(session.id, session.current_question_index), '1');
    setVoted(true);
  }

  return (
    <div className="plai-section">
      <QuestionDisplay
        questionIndex={session.current_question_index}
        totalQuestions={questionSet.questions.length}
        situation={currentQuestion.situation}
      />
      {voted ? (
        <p className="plai-success">Réponse enregistrée — en attente de la suite.</p>
      ) : (
        <AnswerButtons options={questionSet.reponses_possibles} onVote={handleVote} disabled={false} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Join.jsx
git commit -m "feat: participant join and voting page"
```

---

## Task 14: Final routing in App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Rewrite `App.jsx` with all routes and a `ProtectedRoute` guard for host pages**

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { HostNewSession } from './pages/HostNewSession';
import { HostSession } from './pages/HostSession';
import { HostDashboard } from './pages/HostDashboard';
import { Join } from './pages/Join';

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="plai-section">Chargement…</div>;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/join/:code" element={<Join />} />
        <Route
          path="/host/dashboard"
          element={
            <ProtectedRoute>
              <HostDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/new"
          element={
            <ProtectedRoute>
              <HostNewSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/session/:id"
          element={
            <ProtectedRoute>
              <HostSession />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/host/dashboard" replace />} />
        <Route path="*" element={<div className="plai-section">Page introuvable.</div>} />
      </Routes>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify the build passes**

Run: `npx vite build`
Expected: build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: finalize app routing"
```

---

## Task 15: Manual end-to-end verification

Not a TDD step — this exercises the real Supabase project and Realtime, which unit tests can't cover.

- [ ] **Step 1: Create a host account** (Supabase dashboard → Authentication → add user with an FWB pole email), or reuse an existing one from another PLAI app if `profiles` is shared.

- [ ] **Step 2: Run the dev server**

```bash
npm run dev
```

- [ ] **Step 3: Log in, create a session**

In one browser tab: go to `/login`, sign in, go to `/host/new`, create a session named "Test vérification", pick the Chaudfontaine question set. Confirm redirect to `/host/session/:id` showing a QR code and the session code.

- [ ] **Step 4: Join from a second tab (simulating a teacher's phone)**

Open a private/incognito window at `/join/<CODE>` (the code shown on the host screen). Confirm it shows "La session va commencer…".

- [ ] **Step 5: Start the session and vote**

On the host tab, click "Démarrer la session". Confirm the participant tab updates to show question 1 within a couple of seconds (Realtime). Vote on the participant tab. Confirm the host tab's result bar updates live without a manual refresh.

- [ ] **Step 6: Reveal, advance, and finish**

Click "Révéler la réponse" on the host tab — confirm the correct-answer highlight and explanation appear. Click "Question suivante" through all 9 questions, confirm the participant tab tracks along and re-enables voting each time. On the last question, "Question suivante" should end the session — confirm both tabs show a finished state ("Merci pour votre participation !" on the participant side).

- [ ] **Step 7: Confirm double-voting is blocked**

Reload the participant tab mid-question (before advancing) — confirm it shows "Réponse enregistrée" instead of the vote buttons again (sessionStorage guard).

- [ ] **Step 8: Confirm the dashboard shows history**

Go back to `/host/dashboard`. Confirm "Test vérification" appears with statut `terminee`, and clicking it reopens `/host/session/:id` in read-only mode (no host control buttons, since `statut !== 'en_cours'`).

- [ ] **Step 9: Delete the test session**

In the Supabase dashboard, delete the "Test vérification" row from `quizz_sessions` (cascades to its `quizz_responses`) so it doesn't clutter the real dashboard.

---

## Task 16: Deploy (GitHub + Vercel)

- [ ] **Step 1: Verify the build one last time**

```bash
npx vite build
```

Expected: build succeeds with no errors. Do not proceed to push if this fails.

- [ ] **Step 2: Create the GitHub repository** (jfb4plai account, `main` branch)

```bash
cd "C:/Users/jfbeg/OneDrive/claude-workspace/quizzplai"
git branch -M main
git remote add origin https://github.com/jfb4plai/QuizzPLAI.git
git push -u origin main
```

If `origin` already exists or the repo doesn't exist yet on GitHub, stop and confirm with the user before creating it or force-pushing anything.

- [ ] **Step 3: Connect the repo to Vercel**

In the Vercel dashboard: New Project → import `jfb4plai/QuizzPLAI` → framework preset "Vite" → set environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (same values as `.env.local`) → deploy.

- [ ] **Step 4: Attach the subdomain**

In Vercel project settings → Domains → add `quizz-plai.jfb4plai.com`, following the same DNS pattern already used for the other `*.jfb4plai.com` subdomains.

- [ ] **Step 5: Smoke-test the production deployment**

Repeat a shortened version of Task 15 (steps 3–5 only: log in, create a session, join from a second device, vote, confirm live update) against the live `quizz-plai.jfb4plai.com` URL.

- [ ] **Step 6: Update the session memory file**

Edit the "État" line in the QuizzPLAI session memory to reflect completion (deployed, URL, date).
