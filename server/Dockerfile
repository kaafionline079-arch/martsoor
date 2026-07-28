FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY schema.sql ./schema.sql
COPY scripts ./scripts
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "src/index.js"]
