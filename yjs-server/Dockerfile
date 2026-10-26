FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY *.mjs ./
ENV HOST=0.0.0.0 PORT=1234
USER node
EXPOSE 1234
CMD ["node", "server.mjs"]
