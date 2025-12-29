# Node.js image kullanarak bağımlılıkları yükle
FROM node:18-alpine

WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle (npm install otomatik olarak çalışacak)
RUN npm install

# Tüm kaynak dosyalarını kopyala
COPY . .

# Port'u expose et
EXPOSE 3000

# Development modunda çalıştır
CMD ["npm", "start"]

