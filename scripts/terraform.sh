#!/bin/bash

action=$1

source $ROOT_DIR/scripts/helper.sh


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

# Terraform Init - Sourced from helper script.
tf_init

if [[ "$action" == "plan" ]]; then
    plan
elif [[ "$action" == "apply" ]]; then
    apply
elif [[ "$action" == "destroy" ]]; then
    destroy
fi

ok "Terraform Action End"