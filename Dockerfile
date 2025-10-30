
FROM node:18-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --production

RUN apt-get update && \
    npx playwright install-deps chromium && \
    rm -rf /var/lib/apt/lists/*


RUN npx playwright install chromium

COPY . .

EXPOSE 3000

CMD ["npm", "start"]