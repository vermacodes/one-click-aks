#!/bin/bash

# This scripts output is fed as is to the go code.
# This must not print anything but the output its intended to print.

OPTION=$1
WORKSPACE=$2

function init() {
    # Initialize terraform only if not.
    if [[ ! -f .terraform/terraform.tfstate ]] || [[ ! -f .terraform.lock.hcl ]]; then
        terraform init \
            -migrate-state \
            -backend-config="resource_group_name=$resource_group_name" \
            -backend-config="storage_account_name=$storage_account_name" \
            -backend-config="container_name=$container_name" \
            -backend-config="key=$tf_state_file_name" >/dev/null 2>&1
    fi
}

function listWorkspaces() {

    workspaces=$(terraform workspace list)
    IFS=$'\n'
    list=""
    for line in $workspaces; do
        #line=${line/*\* /} # Removes the * from selected workspace.
        #line=${line/*\ /} # Removes leading spaces.
        line=$(echo ${line} | tr -s ' ')
        if [[ "${list}" == "" ]]; then
            list="${line}"
        else
            list="${list},${line}"
        fi
    done
    printf ${list}
}

function selectWorkspace() {
    terraform workspace select $WORKSPACE
}

function createWorkspace() {
    terraform workspace create $WORKSPACE
}

# Script starts here.
cd ${ROOT_DIR}/tf
export ARM_SUBSCRIPTION_ID=$(az account show --output json | jq -r .id)
init

if [[ "$OPTION" == "list" ]]; then
    listWorkspaces
    exit 0
fi

terraform workspace $OPTION $WORKSPACE
