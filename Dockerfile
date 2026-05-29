FROM docker.io/alpine:edge

RUN apk update && apk upgrade
RUN apk add git nodejs npm

RUN mkdir /app
RUN cd /app && git clone https://github.com/nadnone/discord-bot

RUN cd /app/discord-bot/ && echo "config/" > .gitignore
RUN cd /app/discord-bot/ && echo "data/" >> .gitignore

WORKDIR /app/discord-bot/

CMD git fetch origin && git reset --hard origin/main && npm install && node main.js