# ESP32 Relay Dashboard (Vercel-ready)

Interface Node/JS (Next.js) pour piloter et superviser un système de relais ESP32.
Déployable sur **Vercel** en un clic.

## Fonctionnalités
- UI Tailwind réactive (Relais 1/2, Interrupteur local).
- API REST:
  - `POST /api/state` — le microcontrôleur envoie `{ relay1, relay2, switch, source? }`.
  - `GET /api/state` — lit l'état courant.
  - `POST /api/command` — définit une commande `{ relay1?, relay2? }`.
  - `GET /api/command?mode=pop|peek` — le device "poll" la dernière commande (pop la consomme).
- Auth par **token partagé** (optionnel): header `Authorization: Bearer <SHARED_SECRET>`.

> Note: le stockage est **en mémoire** (sans base). Sur Vercel (serverless), l'état peut être perdu après un "cold start".
> Branchez un KV (Vercel KV, Upstash, Supabase...) pour la production.

## Déploiement (Vercel)
1. Poussez ce dossier sur un repo GitHub/GitLab.
2. Sur Vercel > **New Project** > importez le repo.
3. Réglez la variable d'env (optionnelle): `SHARED_SECRET=mon_token_ultra_secret`.
4. Déployez.

## Configuration côté ESP32
Exemples d'appels HTTP à ajouter dans votre `HTTPManager.h/.cpp`:

### Envoyer l'état
```cpp
// URL = https://<your-vercel-domain>/api/state
HTTPClient http;
http.begin("https://YOUR_DOMAIN/api/state");
http.addHeader("Content-Type", "application/json");
http.addHeader("Authorization", "Bearer YOUR_SHARED_SECRET"); // optionnel
String body = String("{"relay1":") + (relay1State ? "true" : "false") +
              ","relay2":" + (relay2State ? "true" : "false") +
              ","switch":" + ((digitalRead(SWITCH1)==LOW) ? "true":"false") +
              ","source":"esp32"}";
http.POST(body);
http.end();
```

### Récupérer la dernière commande
```cpp
// URL = https://<your-vercel-domain>/api/command?mode=pop
HTTPClient http;
http.begin("https://YOUR_DOMAIN/api/command?mode=pop");
http.addHeader("Authorization", "Bearer YOUR_SHARED_SECRET"); // optionnel
int code = http.GET();
if (code == 200) {
  String payload = http.getString(); // JSON: { "command": { "relay1": true/false, "relay2": true/false, "at": "..." } }
  // Parser et appliquer si non nul
}
http.end();
```

## Dev local
```bash
npm i
npm run dev
```
Ouvrez http://localhost:3000

## Personnalisation
- Remplacer le store mémoire `utils/store.ts` par un connecteur durable.
- Modifier le style Tailwind dans `app/page.tsx`.
- Ajouter Webhooks, logs, historisation… selon besoins.

## Licence
MIT
