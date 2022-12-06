#!/bin/bash

# This script breaks cluster.
cd $ROOT_DIR

err() {
  echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')]: ERROR - $*" >&2
}

log() {
  echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')]: INFO - $*" >&1
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
    log "Pulling variables from TF output"
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
    AKS_LOGIN=$(terraform output -raw aks_login)
    CLUSTER_NAME=$(terraform output -raw cluster_name)
    CLUSTER_VERSION=$(terraform output -raw cluster_version)
    RESOURCE_GROUP=$(terraform output -raw resource_group_name)
    VNET_NAME=$(terraform output -json vnet_name)
    NSG_NAME=$(terraform output -json nsg_name)
    ACR_NAME=$(terraform output -json acr_name)
    FIREWALL_PRIVATE_IP=$(terraform output -json firewall_private_ip)
    LOCATION=$(terraform output -json resource_group_location)
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