#!/bin/bash

# This script starts the web app and the server. Both server and the webapp needs to be exposed to the world outside.
#
# WebApp runs on port 3000
# Server runs on port 8080.
export ROOT_DIR=$(pwd)

cd app/ui
npm start

cd app/server
go run .