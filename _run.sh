#!/bin/bash

# apt update
# apt install curl -y
# apt install wget -y
# apt install xsel -y

# Install/Configure everything node.
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# nvm install 16
# npm config set legacy-peer-deps true
npm install


# # Install Azure CLI
# curl -sL https://aka.ms/InstallAzureCLIDeb | bash

apt-get install azure-cli=2.36.0-1~jammy -y

# # Install Terraform
# apt-get update && apt-get install -y gnupg software-properties-common
# wget -O- https://apt.releases.hashicorp.com/gpg | \
#     gpg --dearmor | \
#     tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
# echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
#     https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
#     tee /etc/apt/sources.list.d/hashicorp.list
# apt update
# apt-get install terraform
# terraform --help

# Run UI
npx serve -s &

# Run Server
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
    sleep 5s
done