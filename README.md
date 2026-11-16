# Installation

```bash
npm run build
npm run dev
```

# Dockerfile

Multi-stage image: installs deps with Yarn, builds Next.js **standalone** output, runs `node server.js` as user `nextjs` on port **3000**.

Build (set your API origin; `NEXT_PUBLIC_LANDING` toggles landing-style behavior when set to `true`; `NEXT_PUBLIC_MONOBANK_JAR_ID` (long jar ID) and `NEXT_PUBLIC_MONOBANK_JAR_URL` are optional — the monobank jar widget is shown only when both are set):

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://your-api.example \
  --build-arg NEXT_PUBLIC_LANDING=false \
  --build-arg NEXT_PUBLIC_MONOBANK_JAR_ID=your-long-jar-id \
  --build-arg NEXT_PUBLIC_MONOBANK_JAR_URL=https://send.monobank.ua/jar/your-jar \
  -t asp-web .
```

Run:

```bash
docker run --rm -p 3000:3000 asp-web
```

Then open `http://localhost:3000`.
