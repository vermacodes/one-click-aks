#!/bin/bash

# This script breaks cluster.
cd $ROOT_DIR

# Add some color
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

err() {
  echo -e "${RED}[$(date +'%Y-%m-%dT%H:%M:%S%z')]: ERROR - $* ${NC}" >&1
}

log() {
  echo -e "[$(date +'%Y-%m-%dT%H:%M:%S%z')]: INFO - $*" >&1
}

ok() {
  echo -e "${GREEN}[$(date +'%Y-%m-%dT%H:%M:%S%z')]: INFO - $* ${NC}" >&1
}

function change_to_root_dir() {
    log "Changing to root directory"
    cd $ROOT_DIR
}

function get_aks_credentials() {
    log "Pulling AKS credentials"
    cd tf && terraform output -raw aks_login | bash
    change_to_root_dir
}

function get_kubectl() {
    log "Checking if kubectl exists"
    kubectl version > /dev/null 2>&1
    if [ $? -ne 0 ]; then
      log "kubectl not found. installing."
      az aks install-cli
    fi
}

function tf_init() {
    log "Terraform Init"
    cd tf
    terraform init \
    -migrate-state \
    -backend-config="resource_group_name=$resource_group_name" \
    -backend-config="storage_account_name=$storage_account_name" \
    -backend-config="container_name=$container_name" \
    -backend-config="key=$tf_state_file_name"
    change_to_root_dir
}

function get_variables_from_tf_output () {
    log "Pulling variables from TF output"
    cd tf
    
    # Subscription as Env Variable
    export SUBSCRIPTION_ID=$(az account show --output json | jq -r .id)

    output=$(terraform output -json)

    # Iterate through each output variable and set as an environment variable
    while read -r key value; do
      export "$(echo "$key" | tr '[:lower:]' '[:upper:]')"="$value"
    done <<< "$(echo "$output" | jq -r 'to_entries[] | "\(.key) \(.value.value)"')"


    change_to_root_dir
}

function init() {
    log "Initializing Environment"
    change_to_root_dir
    # tf_init
    get_aks_credentials
    get_kubectl
    get_variables_from_tf_output
}