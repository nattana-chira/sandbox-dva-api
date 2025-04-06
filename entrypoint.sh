#!/bin/sh

# Run Prisma commands
npx prisma generate
npx prisma migrate dev

# Execute CMD passed to ENTRYPOINT (i.e., "npm run dev")
exec "$@"