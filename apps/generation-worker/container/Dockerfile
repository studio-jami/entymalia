FROM node:22-bookworm-slim

WORKDIR /app
ARG APP_DIR=app
COPY ${APP_DIR} ./

ENV PORT=8080
EXPOSE 8080

USER node
CMD ["node", "--import", "tsx", "container/server.ts"]
