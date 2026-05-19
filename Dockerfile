FROM docker.io/alpine:edge

RUN apk update && apk upgrade
RUN apk add git nodejs npm

RUN mkdir /app
RUN cd /app && git clone https://github.com/nadnone/discord-bot.git
RUN cd /app/discord-bot/ && echo "config/" > .gitignore

WORKDIR /app/discord-bot/

RUN mkdir config && mkdir data
RUN touch ./data/warns.json

CMD git fetch origin && git reset --hard origin/main && npm install && node main.js