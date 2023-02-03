#!/bin/bash

# This script starts the web app and the server. Both server and the webapp needs to be exposed to the world outside.
#
# WebApp runs on port 3000
# Server runs on port 8080.

cd tf
rm -rf .terraform
rm .terraform.lock.hcl

cd ../app/server

if [[ "${SAS_URL}" == "" ]]; then
    echo "SAS URL missing"
    exit 1
fi

go build -ldflags "-X 'github.com/vermacodes/one-click-aks/app/server/entity.SasToken=$SAS_TOKEN'"

cd ../..

docker build -t repro .

cd ./app/server
rm server

docker tag repro ashishvermapu/repro:latest
docker push ashishvermapu/repro:latest