FROM node:22.15.0-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh python3 make g++

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

EXPOSE 8080
CMD ["yarn", "run", "web:dev"]