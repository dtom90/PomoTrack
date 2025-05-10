#!/bin/bash
set -e
set -x
THIS_DIR=$(dirname "$0")
cd "${THIS_DIR}/.." || exit

# Runs cypress tests

IMAGE_NAME=pomodash-cypress
CONTAINER_NAME=pomodash-cypress

docker build \
       -f docker/cypress.dockerfile \
       -t ${IMAGE_NAME} \
       . && \
docker run -it --rm \
           --net=bridge \
           --name ${CONTAINER_NAME} \
           --add-host=host.docker.internal:host-gateway \
           --env CYPRESS_BASE_URL='http://host.docker.internal:5173' \
           ${IMAGE_NAME} \
           --browser chrome
