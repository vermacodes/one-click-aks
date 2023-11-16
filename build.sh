#!/bin/bash

# This script starts the web app and the server. Both server and the webapp needs to be exposed to the world outside.
#
# WebApp runs on port 3000
# Server runs on port 8080.

# gather input parameters
# -t tag

while getopts ":t:" opt; do
    case $opt in
    t)
        TAG="$OPTARG"
        ;;
    \?)
        echo "Invalid option -$OPTARG" >&2
        ;;
    esac
done

if [ -z "${TAG}" ]; then
    TAG="latest"
fi

echo "TAG = ${TAG}"

# remove terraform state
cd tf
rm -rf .terraform
rm .terraform.lock.hcl

# build server
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

# build docker image
docker build -t repro:${TAG} .

cd ./app/server
rm server

docker tag repro:${TAG} actlab.azurecr.io/repro:${TAG}

az acr login --name actlab --subscription ACT-CSS-Readiness
docker push actlab.azurecr.io/repro:${TAG}

docker tag repro:${TAG} ashishvermapu/repro:${TAG}
docker push ashishvermapu/repro:${TAG}
