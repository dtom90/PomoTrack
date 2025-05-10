#!/bin/bash
set -e
set -x
THIS_DIR=$(dirname "$0")
cd "${THIS_DIR}/.." || exit

# Runs production container

IMAGE_NAME=pomodash-prod
CONTAINER_NAME=pomodash-prod

if [ "$1" == "-d" ]; then
  RUN_OPTION="-d"
else
  RUN_OPTION="-it"
fi

docker build \
       -f docker/prod.dockerfile \
       -t ${IMAGE_NAME} \
       . && \
docker run ${RUN_OPTION} --rm \
       -p 5173:80 \
       --name ${CONTAINER_NAME} \
       ${IMAGE_NAME}
