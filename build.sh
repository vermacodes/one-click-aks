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

go build -ldflags "-X 'github.com/vermacodes/one-click-aks/app/server/entity.SasToken=$SAS_TOKEN' -X 'github.com/vermacodes/one-click-aks/app/server/entity.StorageAccountName=$STORAGE_ACCOUNT_NAME'"

cd ../..

docker build -t repro .

cd ./app/server
rm server

docker tag repro actlab.azurecr.io/repro

az acr login --name actlab
docker push actlab.azurecr.io/repro

docker tag repro ashishvermapu/repro
docker push ashishvermapu/repro
