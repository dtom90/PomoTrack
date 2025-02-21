#!/bin/bash
set -e
set -x
THIS_DIR=$(dirname "$0")
cd "${THIS_DIR}" || exit

./temp.sh sh -c "yarn run test"
test_exit_code=$?
if [ ${test_exit_code} != 0 ]; then exit ${test_exit_code}; fi
