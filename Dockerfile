FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY scripts ./scripts
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV CONTEXTECF_MCP_DEMO=true
ENV CONTEXTECF_MCP_PORT=3001
ENV CONTEXTECF_MCP_PATH=/mcp
LABEL org.opencontainers.image.title="ContextECF MCP"
LABEL org.opencontainers.image.description="Read-only MCP server for governed enterprise context packages without direct database access."
LABEL org.opencontainers.image.source="https://github.com/Intelligent-Context-AI-Inc/ContextECF-GITHUB"
LABEL org.opencontainers.image.licenses="Apache-2.0"
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
