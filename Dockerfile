FROM docker.io/alpine:edge

RUN apk update && apk upgrade
RUN apk add git nodejs npm

RUN mkdir /app
RUN cd /app && git clone https://github.com/nadnone/discord-bot.git

WORKDIR /app/discord-bot/

CMD git pull && npm install && node main.js