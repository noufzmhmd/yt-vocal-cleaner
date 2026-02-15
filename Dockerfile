FROM node:18-slim

# تثبيت Python + ffmpeg + yt-dlp
RUN apt-get update && apt-get install -y \
    python3 python3-pip ffmpeg yt-dlp && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# تثبيت Spleeter
RUN pip3 install spleeter

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
