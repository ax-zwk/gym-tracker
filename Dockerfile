# --- Build Stage ---
FROM node:24-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy lockfile and configs
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json tsconfig.json ./

# Copy all package.json files to cache dependency installation
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/gym-tracker/package.json ./artifacts/gym-tracker/
COPY artifacts/mockup-sandbox/package.json ./artifacts/mockup-sandbox/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/db/package.json ./lib/db/
COPY lib/integrations/package.json ./lib/integrations/
COPY lib/replit-auth-web/package.json ./lib/replit-auth-web/
COPY scripts/package.json ./scripts/

# Install dependencies (including devDependencies for building)
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build all packages in the workspace
ENV NODE_ENV=production
RUN pnpm run build

# Install production-only dependencies in a separate directory to copy over
RUN pnpm prune --prod

# --- Production Stage ---
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV BYPASS_AUTH=true

# Copy built artifacts and necessary files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder /app/artifacts/api-server/package.json ./artifacts/api-server/package.json
COPY --from=builder /app/artifacts/gym-tracker/dist ./artifacts/gym-tracker/dist
COPY --from=builder /app/lib/db ./lib/db

EXPOSE 8080

# Command to run the Express backend (which serves the frontend assets in production)
CMD ["node", "./artifacts/api-server/dist/index.mjs"]
