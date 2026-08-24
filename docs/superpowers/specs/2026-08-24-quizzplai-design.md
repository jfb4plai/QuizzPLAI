# QuizzPLAI — Design

Date : 2026-08-24
Auteur : Jean-François Beguin (spec issue d'un échange de brainstorming avec Claude)

## Objectif

Outil de présentation en direct (type Kahoot, sans compétition) permettant à un agent du Pôle
de présenter les missions du PLAI aux équipes enseignantes lors de séances de rentrée dans
différentes écoles, à différentes dates. Les enseignants répondent anonymement avec leur
téléphone (sans inscription) via un QR code. Les réponses sont collectées pour orienter la
communication du pôle, sans jamais viser un score individuel ni une compétition.

L'outil est **générique et réutilisable** : le jeu de questions n'est pas figé dans le code,
les sessions sont nommées et datées librement (ex: "École de Chaudfontaine", "Institut Saint-X").
"Chaudfontaine" (le premier jeu de 9 questions fourni par JF) est un exemple de contenu, pas une
contrainte de nommage de l'app.

## Principes non-négociables (rappel CLAUDE.md)
- CSS PLAI partagé (`plai-style.css`), logo `/plai-logo.jpg`, teal `#0a9370` / orange `#f97316`
- RLS Supabase actif, `auth.uid() = user_id` où pertinent
- Aucune clé exposée côté frontend
- Codes anonymes — aucune identification des participants (pas de nom, pas d'email, pas de cookie de suivi)
- Tables préfixées `quizz_`

## Écrans

1. **Host — Connexion** (`/login`) : auth Supabase email/password, réutilise `profiles`.
2. **Host — Nouvelle session** (`/host/new`) : sélectionner un jeu de questions (fichier JSON
   fourni au dépôt, ex: `question-sets/plai-missions.json`), nommer la session (ex: nom d'école),
   choisir la date (par défaut aujourd'hui). Génère un code court unique (6 caractères,
   ex: `CHFT26`), crée la ligne `quizz_sessions`, redirige vers l'écran de présentation.
3. **Host — Présentation** (`/host/session/:id`) :
   - Affiche la question courante en grand (police lisible, contraste fort)
   - QR code pointant vers `https://quizz-plai.jfb4plai.com/join/:code` (généré côté client,
     lib `qrcode`, aucun service externe — vie privée)
   - 3 boutons de réponse affichés en miroir de ce que voient les participants
   - Barres de résultats qui se remplissent en direct sous chaque option, avec compteur
   - Bouton "Question suivante" (avance `current_question_index`), bouton "Terminer la session"
   - Indication de la bonne réponse une fois que l'agent clique "Révéler" (affichage manuel,
     pas automatique — l'agent garde la main sur le rythme et le ton pédagogique)
4. **Host — Dashboard historique** (`/host/dashboard`) : liste des sessions passées
   (nom, date, nombre de répondants), clic → résultats agrégés par question (barres statiques).
5. **Participant** (`/join/:code`, mobile, aucun compte) :
   - Écran d'attente si la session n'a pas encore démarré ("La session va commencer")
   - Question courante + 3 boutons tactiles larges (accessibilité — cible ≥ 44px)
   - Un seul vote possible par question (verrouillage local via `sessionStorage`, pas de compte)
   - Écran d'attente entre les questions ("Réponse enregistrée, en attente de la question suivante")
   - Écran de fin quand l'agent clique "Terminer la session"

## Format d'un jeu de questions (JSON, versionné dans le repo)

```json
{
  "id": "plai-missions-v1",
  "titre": "Le pôle peut-il intervenir ?",
  "reponses_possibles": ["Oui", "Non", "Oui, à certaines conditions"],
  "questions": [
    {
      "situation": "Nous sommes en début d'année : je découvre une classe...",
      "bonne_reponse": 0,
      "explication": "Soutien à l'équipe — objectif pratiques inclusives et mise en place d'AU"
    }
  ]
}
```
`bonne_reponse` est un index (0/1/2) dans `reponses_possibles`. Pas d'UI d'édition dans ce lot
(hors scope, voir plus bas) — un nouveau jeu de questions s'ajoute en déposant un fichier JSON
dans `question-sets/` et en le référençant dans un petit registre `question-sets/index.json`.

## Données (Supabase, projet partagé dfoaumjleqtxjeaplnna, tables préfixées `quizz_`)

### `quizz_sessions`
| colonne | type | notes |
|---|---|---|
| id | uuid pk | |
| code | text unique | 6 car., ex `CHFT26`, généré serveur |
| nom | text | nom libre de la session (école, contexte) |
| date_session | date | |
| question_set_id | text | référence au JSON (`plai-missions-v1`) |
| current_question_index | int | -1 = pas démarré |
| revealed | boolean | affichage de la bonne réponse pour la question courante |
| statut | text | `en_attente` / `en_cours` / `terminee` |
| created_by | uuid | `auth.uid()`, fk vers `profiles` |
| created_at | timestamptz | default now() |

RLS : lecture publique (anon) autorisée sur `code`, `current_question_index`, `revealed`,
`statut`, `question_set_id` — nécessaire pour que les participants sans compte suivent la
session. Écriture réservée à `created_by = auth.uid()`.

### `quizz_responses`
| colonne | type | notes |
|---|---|---|
| id | uuid pk | |
| session_id | uuid fk → quizz_sessions | |
| question_index | int | |
| choice | int | 0/1/2 |
| created_at | timestamptz | default now() |

Aucune colonne d'identification du répondant. RLS : insertion publique (anon) autorisée
(anonymat voulu), lecture réservée au propriétaire de la session (`created_by = auth.uid()`
via jointure) pour le host, ou lecture publique restreinte aux agrégats via une vue
(`quizz_responses_counts`) plutôt que les lignes brutes, pour éviter d'exposer un flux
d'événements individuels à qui devine un `session_id`.

## Flux temps réel (Supabase Realtime, Postgres Changes — pas de canal broadcast séparé)

- Participants et host s'abonnent aux `UPDATE` sur `quizz_sessions` filtrés par `id` →
  changement de `current_question_index` / `revealed` / `statut` propage l'avancement.
- Host s'abonne aux `INSERT` sur `quizz_responses` filtrés par `session_id` → incrémente les
  barres en direct.
- Participant : après un vote, `INSERT` direct dans `quizz_responses` (RLS anon insert).

## Stack

- React 18 + Vite 5 + Tailwind CSS v3, CSS PLAI partagé (`plai-style.css` copié depuis
  `projets/portail-plai`)
- Supabase v2 (auth agents, Postgres, Realtime, RLS)
- `qrcode` (génération QR côté client, pas d'appel à un service tiers)
- Vercel (déploiement continu, `quizz-plai.jfb4plai.com`)
- Pas de fonction serverless / IA dans ce lot (pas de split 80/20 applicable — outil de
  présentation, pas de génération de contenu)

## Hors scope (ce lot)

- UI d'édition des jeux de questions (ajout via fichier JSON + PR, pour l'instant)
- Export CSV des résultats
- Gestion de plusieurs agents animant la même session simultanément
- Reprise de session après rechargement de page host (si l'agent recharge, il rouvre la
  session via le dashboard — `current_question_index` est déjà persistant en base donc l'état
  n'est pas perdu, seule l'expérience de reprise n'est pas peaufinée)

## Accessibilité (CUA)

- Police ≥ 16px, contraste AA minimum, boutons de réponse larges (≥ 44px de cible tactile)
- Pas de dépendance à la couleur seule pour distinguer les 3 réponses (lettres A/B/C en plus
  de la couleur)
- QR code accompagné du code court en texte (`CHFT26`) et de l'URL complète, pour les
  enseignants qui préfèrent taper l'adresse
