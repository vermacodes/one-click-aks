#!/bin/bash
#
#
# Author: vermacodes
#
# This script installs everything you would need in base image. 
# This will help boot speed.
#

apt update
apt install curl -y
apt install wget -y
apt install jq -y
apt install dos2unix -y

# Install redis
add-apt-repository ppa:redislabs/redis
apt install redis-server -y
systemctl enable redis-server


# Install Azure CLI
apt-get install ca-certificates curl apt-transport-https lsb-release gnupg -y
curl -sL https://packages.microsoft.com/keys/microsoft.asc |
    gpg --dearmor |
    tee /etc/apt/trusted.gpg.d/microsoft.gpg > /dev/null
export AZ_REPO=$(lsb_release -cs)
echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $AZ_REPO main" |
    tee /etc/apt/sources.list.d/azure-cli.list
apt-cache policy azure-cli -y
apt-get install azure-cli=2.36.0-1~jammy -y

# Install Terraform
apt-get update && apt-get install -y gnupg software-properties-common
wget -O- https://apt.releases.hashicorp.com/gpg | \
    gpg --dearmor | \
    tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
    https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
    tee /etc/apt/sources.list.d/hashicorp.list
apt update
apt-get install terraform
terraform --help

# Install GIT
apt install git -y

# Install Helm
# I've added install hlem in dockerfile directly. Bring it here for good.
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
