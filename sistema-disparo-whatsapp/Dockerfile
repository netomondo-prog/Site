FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV DATA_DIR=/data

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

VOLUME ["/data"]
EXPOSE 3000
CMD ["node", "server.js"]
