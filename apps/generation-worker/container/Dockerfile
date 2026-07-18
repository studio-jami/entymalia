FROM node:22-bookworm-slim

WORKDIR /workspace
COPY . ./
RUN corepack enable && pnpm install --frozen-lockfile && pnpm --filter etymalia-generation-worker deploy --legacy --prod /app

WORKDIR /app
ENV PORT=8080
EXPOSE 8080

USER node
CMD ["node", "--import", "tsx", "container/server.ts"]
