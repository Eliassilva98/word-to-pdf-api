FROM node:20-bookworm

RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

ENV PORT=5000
EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && npm start"]