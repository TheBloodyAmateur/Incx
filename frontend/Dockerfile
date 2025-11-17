FROM node:20-alpine

WORKDIR /App

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# serve is a tiny static file server for Node
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
