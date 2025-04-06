Copy .env
```bash
cp .env.example .env
```

Option 1: run the development server:
```bash
npm install

** if you dont have npx
npm install -g npx

** if you already have npx
npx prisma generate
npx prisma migrate dev

npm run dev
```

Server running on http://localhost:5000
Swagger running on http://localhost:5000/api-docs

- docker-compose up --build
