#!/bin/bash

# This script is for local testing. It starts both server and UI in one go.

export ROOT_DIR=$(pwd)

if [[ "${SAS_URL}" == "" ]]; then
    echo "SAS URL missing"
    exit 1
fi

cd ./app/server

go build -ldflags "-X 'github.com/vermacodes/one-click-aks/app/server/entity.SasUrl=$SAS_URL'"

redis-cli flushall && export LOG_LEVEL="4" && export PORT="8081" && ./server