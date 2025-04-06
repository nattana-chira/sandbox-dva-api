- npm install
- cp .env.example .env
- npx prisma generate
  
** if you dont have npx
- npm install -g npx

** if you already have npx
- npx prisma migrate dev
- npm run dev

Server running on http://localhost:5000
Swagger running on http://localhost:5000/api-docs

- docker-compose up --build
