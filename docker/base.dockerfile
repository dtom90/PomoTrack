FROM node:22.14.0-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh python3 make g++
