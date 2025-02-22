#!/bin/bash
set -e
set -x
THIS_DIR=$(dirname "$0")
cd "${THIS_DIR}/.." || exit

# Runs temporary container in development mode
# - Node modules installed in Docker image
# - Source code is copied to Docker image
# - Run with additional command to replace default command

IMAGE_NAME=pomotrack-temp
CONTAINER_NAME=pomotrack-temp

docker build \
       -f docker/temp.dockerfile \
       -t ${IMAGE_NAME} \
       . && \
docker run -it --rm \
       -p 8080:8080 \
       --name ${CONTAINER_NAME} \
       ${IMAGE_NAME} \
       "$@"