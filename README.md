Copy .env
```bash
cp .env.example .env
```

Install dependencies
```bash
npm install

** if you dont have npx
npm install -g npx

** if you already have npx
npx prisma generate
npx prisma migrate dev
```

Option 1: run the development server:
```bash
npm run dev
```

Option 2: run on docker container
```bash
docker-compose up --build
```

Server running on http://localhost:5000  
Swagger running on http://localhost:5000/api-docs

