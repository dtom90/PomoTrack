#!/bin/bash
set -e
set -x

docker run --rm \
           --net="host" \
           byrnedo/alpine-curl:0.1.7 \
           --retry 5 --retry-connrefused \
           http://localhost:5173
