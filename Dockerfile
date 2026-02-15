FROM python:3.10-slim

RUN apt-get update && apt-get install -y ffmpeg yt-dlp

RUN pip install spleeter

WORKDIR /app

COPY package*.json ./
RUN apt-get install -y nodejs npm
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
