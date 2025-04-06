## Getting Started  

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

## Description  
- NodeJs + Express for back end server
- MySqlite for quick development
- WebSocket for real-time communication  
- Prisma for database ORM  
- JsonWebToken for authorization  
- Multer for file upload management  
- Jest for unit testing  
- Swagger for API documentation
- Docker for deployment

your-project/
├── node_modules/          # Installed dependencies
├── prisma/                # Prisma schema and migrations
│   ├── migrations/
│   └── schema.prisma
├── public/                # Public assets (for Next.js frontend)
├── src/                   # Source code
│   ├── controllers/       # Express controllers
│   ├── middlewares/       # Express middlewares
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   ├── app.ts             # Express app setup
│   └── server.ts          # App entry point
├── .env                   # Environment variables
├── .gitignore             # Files to be ignored by Git
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose config
├── entrypoint.sh          # Docker entry script
├── package.json           # Project metadata and scripts
├── README.md              # This file
└── tsconfig.json          # TypeScript configuration

