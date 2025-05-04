FROM node:22.15.0-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]
