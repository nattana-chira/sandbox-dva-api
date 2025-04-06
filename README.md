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
- **NodeJs + Express** for back end server -- NestJs is also interesting choice but it would not fit for small size sandbox project
- **MySqlite** for file system database -- I pick this choice purely because of very quick development and no need to set up
- **WebSocket** for real-time communication -- I just want to try native WebSocket without help functions from SocketIO
- **Prisma** for database ORM -- Prisma is suitable for small project and support functional style, unlike TypeORM
- **JsonWebToken** for authorization -- Simple 
- **Multer** for file upload management -- Reduce development time for file upload feature
- **Jest** for unit testing -- Best choice for unit testing
- **Swagger** for API documentation -- Easy integrated with NodeJS + JSDoc, better than PostMan
- **Docker** for deployment  

** For Postgres version, please checkout Branch 'feature/integrate-postgres' **

## Project Structure
```bash
project/
├── prisma/                # Prisma schema and migrations
│   ├── migrations/
│   └── schema.prisma      # Database Schema
├── uploads/               # Public assets (for Next.js frontend)
├── src/                   # Source code
│   ├── modules/           # Seperate each modules to prevent coupling contains routes, services, interfaces, tests
│   │   ├── chat/         
│   │   ├── friend/
│   │   └── user/
│   ├── utils/             # Helper functions
│   ├── config.ts          # Constant variable for .env
│   ├── app.ts             # App middleware
│   ├── server.ts /        # Http server
│   ├── web-socket/        # Web socket server
│   └── swagger.ts         # Swagger config
├── .env                   # Environment variables
```

