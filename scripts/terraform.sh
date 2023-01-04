#!/bin/bash

action=$1

err() {
  echo "$(date +'%Y-%m-%dT%H:%M:%S%z')]: ERROR - $*" >&2
}

log() {
  echo "$(date +'%Y-%m-%dT%H:%M:%S%z')]: INFO - $*" >&1
}

function init() {
    log "Initializing"
    # Initialize terraform only if not.
    if [[ ! -f .terraform/terraform.tfstate ]] || [[ ! -f .terraform.lock.hcl ]]; then
        terraform init \
        -migrate-state \
        -backend-config="resource_group_name=$resource_group_name" \
        -backend-config="storage_account_name=$storage_account_name" \
        -backend-config="container_name=$container_name" \
        -backend-config="key=$tf_state_file_name"
        log "Initialization Complted"
    else 
        log "Already Initialized - Skipped"
    fi
}

function plan() {
    log "Planning"
    terraform plan
}

function apply() {
    log "Applying"
    terraform apply -auto-approve
    if [ $? -ne 0 ]; then
        err "Terraform Apply Failed"
        exit 1
    fi
}

function destroy() {
    log "Destroying"
    terraform destroy -auto-approve
}

function list() {
    log "Listing"
    terraform state list
}

##
## Script starts here.
##

cd $root_directory/$terraform_directory
log "Terraform Environment Variables"
env | grep "TF_VAR" | awk -F"=" '{printf "%s=", $1; print $2 | "jq ."; close("jq ."); }'
echo ""

# Delete existing if init
if [[ "$action" == "init" ]]; then
    rm -rf .terraform*
fi

init

if [[ "$action" == "plan" ]]; then
    plan
elif [[ "$action" == "apply" ]]; then
    apply
elif [[ "$action" == "destroy" ]]; then
    destroy
fi

log "Terraform Action End"