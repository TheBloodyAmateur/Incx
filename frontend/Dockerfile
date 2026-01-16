# Build-Stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Run-Stage mit Nginx als Static-Server + API-Proxy
FROM nginx:1.27-alpine

# Statisches Bundle aus der Build-Stage kopieren
COPY --from=build /app/dist /usr/share/nginx/html

# Eigene Nginx-Konfiguration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
