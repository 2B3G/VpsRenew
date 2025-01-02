# Stage 1: Build
FROM node:alpine AS builder

RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  wqy-zenhei

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

# Stage 2: Runtime
FROM node:alpine AS runtime

RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  wqy-zenhei

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY --from=builder /app /app

EXPOSE 3012
CMD ["node", "main.js"]
