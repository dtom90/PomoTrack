#!/bin/bash
set -e
set -x
THIS_DIR=$(dirname "$0")
cd "${THIS_DIR}" || exit

# Runs development container with source mapping
# - PREREQUISITE: run install.sh to install dependencies
# - Source code is mapped from host
# - Run with additional command to replace default command

IMAGE_NAME=pomotrack-base
CONTAINER_NAME=pomotrack-dev

# shellcheck disable=SC2124
CMD="$@"
if [[ -z "$CMD" ]]; then CMD="yarn run web:dev"; fi

THIS_DIR=$(dirname "$0")
cd "${THIS_DIR}/.." || exit

./install.sh && \
docker run -it --rm \
       -p 8080:8080 \
       -v "$(pwd)":/app \
       -w /app \
       --name ${CONTAINER_NAME} \
       ${IMAGE_NAME} \
       ${CMD}