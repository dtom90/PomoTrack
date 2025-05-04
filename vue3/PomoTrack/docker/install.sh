#!/bin/bash
set -e
set -x
THIS_DIR=$(dirname "$0")
cd "${THIS_DIR}/.." || exit

# Installs node modules to host directory

IMAGE_NAME=pomotrack-base

CMD="$@"
if [[ -z "$CMD" ]]; then CMD="yarn install"; fi

docker build \
       -f docker/base.dockerfile \
       -t ${IMAGE_NAME} \
       . && \
docker run -i --rm \
       -v "$(pwd)":/app \
       -w /app \
       ${IMAGE_NAME} \
       sh -c "${CMD}"