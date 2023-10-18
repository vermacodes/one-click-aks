#!/bin/bash

# This script is for local testing. It starts both server and UI in one go.

export ROOT_DIR=$(pwd)

if [[ "${SAS_TOKEN}" == "" ]]; then
    echo "SAS TOKEN missing"
    exit 1
fi

if [[ "${STORAGE_ACCOUNT_NAME}" == "" ]]; then
    echo "STORAGE ACCOUNT NAME missing"
    exit 1
fi

export ARM_USER_PRINCIPAL_NAME=$(az account show --output json | jq -r .user.name)
if [ $? -ne 0 ]; then
    err "Failed to get user principal name from az cli"
    exit 1
fi

echo "Storage Account -> ${STORAGE_ACCOUNT_NAME}"
cd ./app/server

export VERSION="$(date +%Y%m%d)"

go build -ldflags "-X 'github.com/vermacodes/one-click-aks/app/server/entity.SasToken=$SAS_TOKEN' -X 'github.com/vermacodes/one-click-aks/app/server/entity.StorageAccountName=$STORAGE_ACCOUNT_NAME'"

redis-cli flushall && export LOG_LEVEL="0" && export PORT="8881" && ./server
