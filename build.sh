#!/bin/bash

# This script starts the web app and the server. Both server and the webapp needs to be exposed to the world outside.
#
# WebApp runs on port 3000
# Server runs on port 8080.

cd tf
rm -rf .terraform
rm .terraform.lock.hcl

cd ../app/server

go build

cd ../ui

npm run build

cd ../..

docker build -t repro .

cd app/server
rm server

cd ../ui
rm -rf ./build