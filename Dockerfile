FROM node:18

# تثبيت ffmpeg و python و pip
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip

# تثبيت yt-dlp
RUN pip install yt-dlp

# مجلد العمل
WORKDIR /app

# نسخ ملفات المشروع
COPY package*.json ./
RUN npm install

COPY . .

# فتح البورت
EXPOSE 3000

# تشغيل السيرفر
CMD ["node", "server.js"]
