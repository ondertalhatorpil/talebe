# Build aşaması
FROM node:20-alpine as build

WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyala
COPY package.json ./

# react-chartjs ve chart.js arasındaki çakışmayı çözmek için
RUN npm install --legacy-peer-deps

# Kaynak kodları kopyala
COPY . .

# Projeyi derle
RUN npm run build

# Çalışma aşaması
FROM nginx:alpine

# Nginx yapılandırmasını kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build çıktısını nginx'in servis ettiği dizine kopyala
COPY --from=build /app/dist /usr/share/nginx/html

# 80 portunu dışarı aç
EXPOSE 80

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]