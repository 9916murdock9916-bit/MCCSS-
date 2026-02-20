FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --production --prefer-offline --no-audit || true
COPY . .
EXPOSE 8000 9321
CMD ["node", "./bin/admin-server.js"]
