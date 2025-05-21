# Node.js tabanlı imaj kullan
FROM node:20-alpine

# Çalışma dizinini oluştur
WORKDIR /usr/src/app

# package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci --only=production

# Uygulama kaynak kodlarını kopyala
COPY . .

# Uploads dizinini oluştur (statik dosyalar için)
RUN mkdir -p uploads

# Gerekli izinleri ver
RUN chmod -R 755 ./uploads

# Çalışma anında kullanılacak port
EXPOSE 3000

# Sağlık kontrolü için bekleme süresi
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Uygulamayı başlat
CMD ["node", "server.js"]