#!/bin/bash

# # Loading variables to run NVM
# export NVM_DIR="$HOME/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
# [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# # Installing any packages which may not be in base image.
# npm install

# # Run UI
# npx serve -s &

# Run Server
# Following peice of code starts the server if it crashes. Health check every 5s
# TODO: make it resilient so that it doesnt crash at all :)

chmod +x server
export ROOT_DIR=$(pwd)

while true
do
    export STATUS=$(curl -s http://localhost:8080/status | jq -r .status)
    echo "$(date) : Status : $STATUS"
    if [ "$STATUS" != "OK" ]; then
        echo "$(date) : App Started."
        ./server
    fi
    sleep 2s
done