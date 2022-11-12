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
    kubectl version
    if [ $? -ne 0 ]; then
      log "kubectl not found. installing."
      az aks install-cli
    fi
}

function get_variables_from_tf_output () {
    log "Pulling variables from TF output"
    cd tf
    CLUSTER_NAME=$(terraform output -raw cluster_name)
    RESOURCE_GROUP=$(terraform output -raw resource_group_name)
    VNET_NAME=$(terraform output -json vnet_name | jq -r .[0])
    change_to_root_dir
}

function init() {
    log "Initializing Environment"
    change_to_root_dir
    get_aks_credentials
    get_kubectl
    get_variables_from_tf_output
}