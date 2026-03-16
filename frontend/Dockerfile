# Imagem de desenvolvimento do frontend Next.js.
FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .

EXPOSE 3000
