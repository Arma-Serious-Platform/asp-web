# Installation

```bash
npm run build
npm run dev
```

# Dockerfile

Multi-stage image: installs deps with Yarn, builds Next.js **standalone** output, runs `node server.js` as user `nextjs` on port **3000**.

Build (set your API origin; `NEXT_PUBLIC_LANDING` toggles landing-style behavior when set to `true`):

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://your-api.example \
  --build-arg NEXT_PUBLIC_LANDING=false \
  -t asp-web .
```

Run:

```bash
docker run --rm -p 3000:3000 asp-web
```

Then open `http://localhost:3000`.
