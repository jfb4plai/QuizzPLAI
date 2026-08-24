-- QuizzPLAI schema. Run in the Supabase SQL editor for project dfoaumjleqtxjeaplnna.
-- Reuses the shared `profiles` table and `updated_at` trigger already present in that project.
-- Do not recreate them here.

create table if not exists quizz_sessions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom text not null,
  date_session date not null default current_date,
  question_set_id text not null,
  -- Ordre d'affichage tiré au hasard à la création de la session (voir src/lib/shuffle.js) :
  -- question_order[i] = index original de la question affichée en position i ;
  -- answer_order[i] = permutation des index originaux des 3 réponses pour cette position.
  -- Les réponses (quizz_responses) sont toujours enregistrées avec les index ORIGINAUX,
  -- pas les positions affichées, pour rester comparables entre sessions mélangées différemment.
  question_order jsonb,
  answer_order jsonb,
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

create policy "quizz_sessions_owner_delete" on quizz_sessions
  for delete using (auth.uid() = created_by);

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
