# TalkToLead Web App Deployment Guide

## Quick Deploy to Vercel

### Step 1: Login to Vercel
```bash
cd ~/workspace/talktolead_webapp_v2
npx vercel login
```

### Step 2: Configure Environment Variables
In Vercel dashboard, add:
- `NEXT_PUBLIC_API_URL` = `https://manage.talktolead.ai`

Or via CLI:
```bash
npx vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://manage.talktolead.ai
```

### Step 3: Deploy
```bash
# Preview deployment
npx vercel

# Production deployment
npx vercel --prod
```

### Step 4: Custom Domain (Optional)
```bash
npx vercel domains add app.talktolead.ai
```

---

## Local Development

```bash
# Install dependencies
npm install

# Create local env file
cp .env.example .env.local

# Start dev server
npm run dev
```

Open http://localhost:3000

---

## Build Verification

```bash
# Run tests
npm test

# Run linting
npm run lint

# Production build
npm run build
```

---

## Demo Mode

The app includes a demo mode for testing without backend:
- Use email: `demo@talktolead.ai`
- Any password works
- Shows sample data for UI testing

---

## Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules .next
npm install
npm run build
```

### API connection issues
1. Check NEXT_PUBLIC_API_URL is set correctly
2. Verify backend is running at https://manage.talktolead.ai
3. Check browser console for CORS errors

---

## Region Selection

Vercel.json is configured for HKG1 (Hong Kong) region for best latency in Asia.
Change `regions` in vercel.json if deploying elsewhere.
