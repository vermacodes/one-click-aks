#!/bin/bash

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


# Define variables
RESOURCE_GROUP="repro-project"
USER_NAME=$(az account show --query "user.name" -o tsv)
USER_ALIAS=$(az account show --query user.name -o tsv | cut -d '@' -f1)
SUBSCRIPTION_ID=$(az account show --query "id" -o tsv)
SP_NAME="${USER_ALIAS}-actlabs"
# SP_OBJECT_ID=$(az ad sp list --display-name "${SP_NAME}" --query "[].id" -o tsv)

# # Check if the service principal exists
# log "checking if service principal ${SP_NAME} exists"
# SP_APP_ID=$(az ad sp list --display-name "${SP_NAME}" --query "[].appId" -o tsv)
# if [[ -n "${SP_APP_ID}" ]]; then
#     log "Service principal already exists with appId ${SP_APP_ID}"
# else
#     err "Service principal does not exist"
#     exit 1
# fi

# # Check if the service principal is already a contributor to the subscription
# log "checking if service principal ${SP_NAME} is a contributor to subscription"
# if [[ $(az role assignment list --assignee "${SP_OBJECT_ID}" --role "Contributor" --scope "/subscriptions/${SUBSCRIPTION_ID}" --query "[].id" -o tsv) ]]; then
#     log "Service principal ${SP_NAME} is already a Contributor for subscription ${SUBSCRIPTION_ID}"
# else
#     err "Service principal ${SP_NAME} is not a Contributor for subscription ${SUBSCRIPTION_ID}"
#     exit 1
# fi

# # Check if the service principal is already a user access administrator for the subscription.
# log "checking if service principal ${SP_NAME} is a user access administrator to subscription"
# if [[ $(az role assignment list --assignee "${SP_OBJECT_ID}" --role "User Access Administrator" --scope "/subscriptions/${SUBSCRIPTION_ID}" --query "[].id" -o tsv) ]]; then
#     log "Service principal ${SP_NAME} is already a User Access Administrator for subscription ${SUBSCRIPTION_ID}"
# else
#     err "Service principal ${SP_NAME} is not a User Access Administrator for subscription ${SUBSCRIPTION_ID}"
#     exit 1
# fi

# checking if keyvualt exists in resource group repro-project
log "checking if key vault exists in resource group ${RESOURCE_GROUP}"
KEY_VAULT_NAME=$(az keyvault list --resource-group "${RESOURCE_GROUP}" --query "[].name" -o tsv)
if [[ -n "${KEY_VAULT_NAME}" ]]; then
    log "Key vault exists with name ${KEY_VAULT_NAME}"
else
    err "Key vault does not exist in resource group ${RESOURCE_GROUP}"
    exit 1
fi

# Checking for secrets in keyvault.
log "checking if secrets arm-client-id and arm-client-secret exist in key vault ${KEY_VAULT_NAME}"
ID_SECRET=$(az keyvault secret show --name "arm-client-id" --vault-name "${KEY_VAULT_NAME}" --query "value" -o tsv)
SECRET_SECRET=$(az keyvault secret show --name "arm-client-secret" --vault-name "${KEY_VAULT_NAME}" --query "value" -o tsv)

if [[ -n "${ID_SECRET}" && -n "${SECRET_SECRET}" ]]; then
    log "Secrets arm-client-id and arm-client-secret already exist in key vault ${KEY_VAULT_NAME}"
else
    err "Secrets arm-client-id and arm-client-secret do not exist in key vault ${KEY_VAULT_NAME}"
    exit 1
fi

ok "All checks passed"
sleep 2s