#!/bin/bash

# This script starts the web app and the server. Both server and the webapp needs to be exposed to the world outside.
#
# WebApp runs on port 3000
# Server runs on port 8080.

cd tf
rm -rf .terraform
rm .terraform.lock.hcl

cd ../app/server

if [[ "${SAS_TOKEN}" == "" ]]; then
    echo "SAS URL missing"
    exit 1
fi

if [[ "${STORAGE_ACCOUNT_NAME}" == "" ]]; then
    echo "SAS URL missing"
    exit 1
fi

export VERSION="$(date +%Y%m%d)"

go build -ldflags "-X 'main.version=$VERSION' -X 'github.com/vermacodes/one-click-aks/app/server/entity.SasToken=$SAS_TOKEN' -X 'github.com/vermacodes/one-click-aks/app/server/entity.StorageAccountName=$STORAGE_ACCOUNT_NAME'"

cd ../..

docker build -t repro:latest .

cd ./app/server
rm server

docker tag repro:latest actlab.azurecr.io/repro:latest

az acr login --name actlab
docker push actlab.azurecr.io/repro:latest

docker tag repro:latest ashishvermapu/repro:latest
docker push ashishvermapu/repro:latest
