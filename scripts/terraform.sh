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
    if [ $? -ne 0 ]; then
        err "Terraform Destroy Failed"
        exit 1
    fi
}

function list() {
    log "Listing"
    terraform state list
}

function getSecertsFromKeyVault() {
    # Following two are already availabe.
    export ARM_SUBSCRIPTION_ID=$(az account show --output json | jq -r .id)
    export ARM_TENANT_ID=$(az account show --output json | jq -r .tenantId)

    # Resource group need not be changed.
    RESOURCE_GROUP_NAME="repro-project"

    log "Pulling secrets from keyvault. This will take just a few moments."

    # Get the name of the Key Vault in the resource group
    KEY_VAULT_NAME=$(az keyvault list --resource-group "${RESOURCE_GROUP_NAME}" --query "[].name" -o tsv)
    if [ $? -ne 0 ]; then
        err "Failed to get key vault name in resource group ${RESOURCE_GROUP_NAME}"
        return 1
    fi
    # Get a list of all secrets in the Key Vault
    SECRET_NAMES=$(az keyvault secret list --vault-name "${KEY_VAULT_NAME}" --query "[].name" -o tsv)
    if [ $? -ne 0 ]; then
        err "Failed to get secrets from key vault ${KEY_VAULT_NAME}"
        return 1
    fi

    # Loop through the list of secrets and set them as environment variables
    for SECRET_NAME in $SECRET_NAMES; do
        ENV_VAR_NAME=$(echo "$SECRET_NAME" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
        SECRET_VALUE=$(az keyvault secret show --vault-name "${KEY_VAULT_NAME}" --name "${SECRET_NAME}" --query "value" -o tsv)
        if [ $? -ne 0 ]; then
            err "Failed to get secret ${SECRET_NAME} from key vault ${KEY_VAULT_NAME}"
            return 1
        fi
        export "${ENV_VAR_NAME}"="${SECRET_VALUE}"
    done

    return 0
}

##
## Script starts here.
##

# Getting secrets from keyvault.
# if getSecertsFromKeyVault; then
#     ok "Secrets pulled from keyvault."
# else
#     err "Failed to pull secrets from keyvault."
#     exit 1
# fi

export ARM_SUBSCRIPTION_ID=$(az account show --output json | jq -r .id)

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
