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
curl -sL https://aka.ms/InstallAzureCLIDeb | bash

# Suppress Azure CLI warnings.
az config set core.only_show_errors=true

# Install Terraform
apt-get update && apt-get install -y gnupg software-properties-common
wget -O- https://apt.releases.hashicorp.com/gpg |
    gpg --dearmor |
    tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
    https://apt.releases.hashicorp.com $(lsb_release -cs) main" |
    tee /etc/apt/sources.list.d/hashicorp.list
apt-get update
apt-get install terraform -y
terraform --help

# Install GIT
apt install git -y

# Install Helm
# I've added install hlem in dockerfile directly. Bring it here for good.
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install OpenShift CLI
# https://learn.microsoft.com/en-us/azure/openshift/tutorial-connect-cluster#install-the-openshift-cli

cd ~
wget https://mirror.openshift.com/pub/openshift-v4/clients/ocp/latest/openshift-client-linux.tar.gz

mkdir openshift
tar -zxvf openshift-client-linux.tar.gz -C openshift
echo 'export PATH=$PATH:~/openshift' >>~/.bashrc && source ~/.bashrc
cd -
