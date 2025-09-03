<a href="https://podkids-web.vercel.app">
  <img alt="Podkids" src="/images/podkids.png">
  <h1 align="center">Podkids</h1>
</a>

<p align="center">
  Podkids l'application de podcasts pour les enfants, pensée par les parents.
</p>
<br/>


# Podkids

Podkids est une application de gestion et d’écoute de podcasts pensée pour les enfants, avec un contrôle parental simple et une interface adaptée. Les parents peuvent sélectionner des podcasts, créer des profils enfants et sécuriser l’accès via un code PIN.

- Sans publicité, orientée sécurité et respect de la vie privée
- Interface simple, accessible et agréable pour les enfants
- Contrôle parental: sélection des contenus, profils, PIN
- Existe en application mobile et version web

## Démo rapide

- Accueil: `app/page.tsx` affiche `Hero`, `About`, `Features`, des captures et un bouton d’accès à la version web (`AuthButton`).
- Espace protégé (après connexion): gestion et liste des podcasts via `app/protected/podcasts/page.tsx`.

---

## Présentation technique

- Framework: Next.js (App Router)
- Auth & backend: Supabase via `@supabase/ssr` et `@supabase/supabase-js`
- UI: Tailwind CSS + lucide-react
- Player audio: provider maison (`components/webplayer/AudioPlayerProvider.tsx`) avec play/pause/seek et barre de player
- Parsing RSS: `fast-xml-parser` (voir `lib/rss/parse.ts`)
- Routage protégé: dossiers `app/protected/*` + intégration Supabase côté serveur (`lib/supabase/*`, `middleware.ts`)
- Accessibilité (travail en cours)
- TypeScript

Arborescence (extraits)

- `app/`: pages App Router (auth, protected, routing dynamique)
- `components/`: UI réutilisables, homepage, player, protected
- `lib/`: `supabase/` (client, admin, middleware), `rss/` (hydrate/parse)
- `utils/`: utilitaires (slugify, sanitize, ageRange, etc.)
- `types/`: types `podcast`, `profile`, `supabase`

---

## Prérequis

- Node.js 18+
- npm (ou pnpm/yarn)
- Un projet Supabase (URL + clé publishable/anon)

---

## Installation et démarrage

1) Cloner et installer

```bash
git clone <repo>
cd podkids-web
npm install
```

2) Variables d’environnement

Créer un fichier `.env.local` à la racine avec:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Ces valeurs sont disponibles dans le Dashboard Supabase > Project Settings > API.

3) Lancer en local

```bash
npm run dev
```

Ouvrir http://localhost:3000

4) Scripts utiles

- `dev`: Next.js avec Turbopack
- `build`: build de production
- `start`: serveur de prod
- `lint`: ESLint

---

## Fonctionnalités clés

- Auth Supabase (email/password, magic link, reset)
  - Pages: `app/auth/*` (login, sign-up, confirm, forgot/update password, pin)
- Contrôle parental & profils
  - PIN modal et gestion: `components/webplayer/PinModal.tsx`, routes sous `app/protected/pin`
  - Profil actif: `hooks/useActiveProfile.ts`, `components/webplayer/ActiveProfileInitializer.tsx`
- Gestion des podcasts
  - Page de gestion: `app/protected/podcasts/page.tsx` + `components/protected/PodcastsManager.tsx` et `PodcastsList.tsx`
  - Public/privé: jointures `podcast` / `private_podcast` côté Supabase
  - Parsing des flux RSS: `lib/rss/parse.ts` (titre, auteur, cover, épisodes, durée, date)
- Lecture audio
  - Contexte player: `components/webplayer/AudioPlayerProvider.tsx` (play, toggle, seek)
  - UI: `components/webplayer/PlayerBar.tsx`, `components/webplayer/NavActions.tsx`

---

## Configuration Supabase (guide rapide)

1. Créer un projet Supabase et récupérer:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Schéma indicatif :
   - Voir dans supabase > Table
3. SSR/middleware: `@supabase/ssr` avec session via cookies
4. Clients:
   - Navigateur: `lib/supabase/client.ts`
   - Serveur: `lib/supabase/server.ts` (si présent) et `middleware.ts`

---

## Déploiement

- Vercel recommandé (support natif Next.js)
- Ajouter les variables env dans le dashboard Vercel
- Build: `npm run build` puis `npm run start` en prod (autres hébergeurs)
- Assets publics: `public/` (images, icônes, avatars)

---

## Dépannage

- 401/redirect sur pages protégées: vérifier cookies Supabase et config `@supabase/ssr`
- Player ne lit pas l’audio:
  - Vérifier l’URL d’enclosure dans le flux RSS
  - CORS/headers côté source audio
- Parsing RSS échoue:
  - Inspecter le flux via `lib/rss/parse.ts` (certains feeds Atom utilisent `link rel="enclosure"`)

---

## Licence

Projet propriétaire. Icônes/images: voir `public/icons/` et `public/images/`.

