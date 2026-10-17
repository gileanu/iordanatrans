# Iordana Trans

Aplicație Next.js pentru afișarea și rezervarea curselor de autocar.

## Rute

- `/` – pagina principală, cu următoarele curse disponibile
- `/cursa` – toate cursele, cu filtrare și sortare
- `/cursa/[cursa_id]` – detaliile cursei și formularul de rezervare
- `/contact` – formular de contact (pregătit pentru integrarea cu un backend)
- `/dash` – panou de administrare (autentificare obligatorie, `noindex`)

## Configurare

Copiază `.env.example` în `.env.local` și completează valorile:

```bash
cp .env.example .env.local
```

- `ADMIN_USERNAME`, `ADMIN_PASSWORD` – contul de administrator (doar pe server)
- `SESSION_SECRET` – minimum 32 de caractere aleatoare (`openssl rand -base64 48`)
- `DATABASE_URL`, `DATABASE_AUTH_TOKEN` – opționale, vezi mai jos

## Baza de date

Aplicația folosește [libSQL](https://github.com/tursodatabase/libsql) (compatibil SQLite).
Tabelele sunt create automat la prima pornire.

- **Local / server propriu (VPS, Docker cu volum persistent):** fără `DATABASE_URL`,
  datele sunt salvate în fișierul `data/iordanatrans.db`.
- **Serverless (ex. Vercel):** sistemul de fișiere nu este persistent, deci setează
  `DATABASE_URL=libsql://...` și `DATABASE_AUTH_TOKEN` către o bază de date
  [Turso](https://turso.tech). Codul rămâne neschimbat.

Locurile disponibile se calculează automat: `capacitate − locuri confirmate − locuri în așteptare`.
Rezervările în așteptare blochează locurile, astfel încât confirmarea lor nu poate produce
suprarezervări. Rezervarea este inserată printr-o singură instrucțiune SQL atomică, care
verifică disponibilitatea în momentul scrierii.

## Dezvoltare

```bash
bun install
bun run dev
```
