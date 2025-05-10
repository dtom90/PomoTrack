#!/bin/bash
set -e
set -x
THIS_DIR=$(dirname "$0")
cd "${THIS_DIR}/.." || exit

# Runs temporary container in development mode
# - Node modules installed in Docker image
# - Source code is copied to Docker image
# - Run with additional command to replace default command

IMAGE_NAME=pomodash-temp
CONTAINER_NAME=pomodash-temp

docker build \
       -f docker/temp.dockerfile \
       -t ${IMAGE_NAME} \
       . && \
docker run -it \
       --name ${CONTAINER_NAME} \
       ${IMAGE_NAME} \
       sh -c 'npm run build && cp -r .circleci dist_web && cp CNAME dist_web' && \
docker cp ${CONTAINER_NAME}:/app/dist_web ./dist_web && \
docker rm -f ${CONTAINER_NAME}
