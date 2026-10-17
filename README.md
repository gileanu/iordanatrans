# Iordana Trans

Aplicație Next.js pentru afișarea și rezervarea curselor de autocar.

## Rute

- `/` – pagina principală, cu următoarele curse disponibile
- `/cursa` – toate cursele, cu filtrare și sortare
- `/cursa/[cursa_id]` – detaliile cursei și formularul de rezervare
- `/contact` – formular de contact (pregătit pentru integrarea cu un backend)
- `/dash` – panou de administrare (autentificare obligatorie, `noindex`)

## Configurare

Baza de date este PostgreSQL pe [Supabase](https://supabase.com), accesată prin Prisma.
Copiază `.env.example` în `.env` și completează valorile (pe Vercel, adaugă-le în
Settings → Environment Variables):

- `DATABASE_URL` – connection pooler Supabase, transaction mode (port 6543)
- `DIRECT_URL` – conexiune directă / session pooler (port 5432), folosită la migrări
- `SESSION_SECRET` – minimum 32 de caractere aleatoare (`openssl rand -base64 48`)

Creează tabelele (o singură dată și după fiecare migrare nouă):

```bash
bun run db:migrate
```

Migrarea activează Row Level Security pe toate tabelele, astfel încât acestea nu sunt
accesibile prin API-ul public Supabase; aplicația le accesează doar prin Prisma.

## Utilizatori și administrator

Fiecare rezervare este asociată unui utilizator (`User`, rol `USER`), creat automat
după adresa de email. Pentru a face un utilizator administrator:

1. Generează hash-ul parolei: `bun run admin:hash-password`
2. Deschide Prisma Studio (`bun run db:studio`), creează sau alege utilizatorul,
   setează `role` = `ADMIN` și lipește hash-ul în `passwordHash`.
3. Autentifică-te în `/dash` cu emailul și parola utilizatorului.

Retrogradarea la `USER` revocă imediat accesul la `/dash`.

## Disponibilitatea locurilor

Locurile disponibile se calculează automat: `capacitate − locuri confirmate − locuri în așteptare`.
Rezervările în așteptare blochează locurile, astfel încât confirmarea lor nu poate produce
suprarezervări. La rezervare, rândul cursei este blocat (`SELECT … FOR UPDATE`) pe durata
tranzacției, deci rezervările simultane pentru aceeași cursă sunt procesate pe rând.

## Dezvoltare

```bash
bun install
bun run dev
```
# iordanatrans
