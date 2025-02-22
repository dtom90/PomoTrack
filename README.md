# PomoTrack
[![CircleCI](https://circleci.com/gh/dtom90/PomoTrack.svg?style=svg)](https://circleci.com/gh/dtom90/PomoTrack)

A pomodoro timer app with task tracking

Written in [Vue.js](https://vuejs.org/)

## Setup
```
yarn
```
#### Install in Docker for development:
```
./docker/install.sh
```

## Development
#### Compile and hot-reload for development:
```
yarn run web:dev
```
#### Deploy container for development:
```
./docker/dev.sh
```

## Test
#### Lint and fix source files
```
yarn run lint
```
#### Run basic tests (lint, audit)
```
yarn run test:basic
```
#### Run all tests in Docker containers
```
./docker/test_all.sh
```

## Production
#### Compile and minify for production
```
yarn run build
```
#### Serve production files
```
yarn run serve:prod
```
#### Build Docker image and deploy container for production:
```
./docker/prod.sh
```
