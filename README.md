# Wspólne Wakacje - Latwiejsze Planowanie

Aplikacja do planowania wakacji z możliwością dodawania ofert, tworzenia list i oceniania hoteli!

## Technologie

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Baza danych**: Supabase (PostgreSQL)
- **Deploy**: Vercel

## Konfiguracja Supabase

1. Załóż konto na [supabase.com](https://supabase.com)
2. Stwórz nowy projekt
3. Przejdź do edytora SQL i wklej zawartość pliku `supabase-schema.sql`
4. Skopiuj `Project URL` i `anon public key` z ustawień projektu (Settings → API)
5. Wklej je do pliku `backend/.env`:

```env
SUPABASE_URL=twój_url_supabase
SUPABASE_ANON_KEY=twój_anon_key
```

## Instalacja i uruchomienie

1. Zainstaluj zależności w obu katalogach:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Uruchom backend:
   ```bash
   cd backend && npm run dev
   ```

3. Uruchom frontend w nowym terminalu:
   ```bash
   cd frontend && npm run dev
   ```

## Deploy na Vercel

1. Umieść projekt na GitHubie/GitLabie/Bitbuckecie
2. Wejdź na [vercel.com](https://vercel.com) i zaimportuj repozytorium
3. Dodaj zmienne środowiskowe w ustawieniach projektu Vercel (takie same jak w pliku `.env`)
4. Kliknij "Deploy"!

## Autor

Dawid Thai Thanh (ACOST - All Company OS by Tajski)
