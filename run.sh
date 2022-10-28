#!/bin/bash

# This script is for local testing. It starts both server and UI in one go.

export ROOT_DIR=$(pwd)

cd app/server
go run . &

cd ../ui
npm start