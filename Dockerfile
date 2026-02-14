FROM node:18

# تثبيت ffmpeg و python و pip و yt-dlp من apt
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip yt-dlp

# مجلد العمل
WORKDIR /app

# نسخ ملفات npm أولاً
COPY package*.json ./
RUN npm install

# نسخ بقية المشروع
COPY . .

# فتح البورت
EXPOSE 3000

# تشغيل السيرفر
CMD ["node", "server.js"]
