FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

EXPOSE 1234

CMD ["node", "node_modules/y-websocket/bin/server.js"]
