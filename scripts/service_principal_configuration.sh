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

# Function to check if a key vault exists in a resource group
# If the key vault doesn't exist, create one with a random name
# and give the current user full access to secrets in the key vault
function create_keyvault() {
    # Check if the key vault exists in the resource group
    log "checking if key vault exists in resource group ${RESOURCE_GROUP}"
    KV_EXISTS=$(az keyvault list --resource-group "${RESOURCE_GROUP}" --query "[].name" -o tsv)

    if [[ -n "${KV_EXISTS}" ]]; then
        log "Key vault already exists with name ${KV_EXISTS}"
        return 0
    else
        # Generate a random name for the key vault
        RANDOM_NAME=$(openssl rand -hex 4)
        KEY_VAULT_NAME="${USER_ALIAS}-kv-${RANDOM_NAME}"

        log "key vault does not exist, creating with name ${KEY_VAULT_NAME} in resource group ${RESOURCE_GROUP}"
        # Create the key vault
        az keyvault create --name "${KEY_VAULT_NAME}" --resource-group "${RESOURCE_GROUP}" --sku standard
        if [ $? -ne 0 ]; then
            err "Failed to create key vault ${KEY_VAULT_NAME}"
            return 1
        else
            log "Key vault ${KEY_VAULT_NAME} created"
        fi

        # Give the current user full access to secrets in the key vault
        az keyvault set-policy --name "${KEY_VAULT_NAME}" --resource-group "${RESOURCE_GROUP}" --upn "${USER_NAME}" --secret-permissions get set list delete backup restore recover purge
        if [ $? -ne 0 ]; then
            err "Failed to set policy for key vault ${KEY_VAULT_NAME}"
            return 1
        else
            log "Policy set for key vault ${KEY_VAULT_NAME}"
        fi
    fi

    return 0
}

# Function to create a service principal and set its credentials as secrets in the key vault
function create_service_principal() {

    log "getting key vault name in resource group ${RESOURCE_GROUP}"
    KEY_VAULT_NAME=$(az keyvault list --resource-group "${RESOURCE_GROUP}" --query "[].name" -o tsv)

    # Check if the arm-client-id and arm-client-secret secrets exist in the key vault
    log "checking if secrets arm-client-id and arm-client-secret exist in key vault ${KEY_VAULT_NAME}"

    # Get the secrets from the key vault
    # Uncomment following lines to not reset the secrets if they exist in the key vault.
    # ID_SECRET=$(az keyvault secret show --name "arm-client-id" --vault-name "${KEY_VAULT_NAME}" --query "value" -o tsv)
    # SECRET_SECRET=$(az keyvault secret show --name "arm-client-secret" --vault-name "${KEY_VAULT_NAME}" --query "value" -o tsv)

    # if [[ -n "${ID_SECRET}" && -n "${SECRET_SECRET}" ]]; then
    #     log "Secrets arm-client-id and arm-client-secret already exist in key vault ${KEY_VAULT_NAME}"
    #     return 0
    # fi

    # Check if the service principal already exists
    log "checking if service principal ${SP_NAME} exists"
    SP_APP_ID=$(az ad sp list --display-name "${SP_NAME}" --query "[].appId" -o tsv)

    if [[ -n "${SP_APP_ID}" ]]; then
        log "Service principal already exists with appId ${SP_APP_ID}"

        # Reset the password for the existing service principal
        log "resetting password for service principal ${SP_NAME}"
        SP_PASSWORD=$(az ad sp credential reset --id "${SP_APP_ID}" --query "password" -o tsv)
        if [ $? -ne 0 ]; then
            err "Failed to reset password for service principal ${SP_NAME}"
            return 1
        else
            log "Password reset for service principal ${SP_NAME}"
        fi

    else
        # Create the service principal
        log "creating service principal ${SP_NAME}"
        SP_PASSWORD=$(az ad sp create-for-rbac --name "${SP_NAME}" --skip-assignment --query "password" -o tsv)
        if [ $? -ne 0 ]; then
            err "Failed to create service principal ${SP_NAME}"
            return 1
        else
            log "Service principal ${SP_NAME} created"
        fi

        log "getting appId for service principal ${SP_NAME}"
        SP_APP_ID=$(az ad sp list --display-name "${SP_NAME}" --query "[].appId" -o tsv)

        # Print the service principal credentials
        log "Service principal created with appId ${SP_APP_ID} and password REDACTED"
    fi

    # Set the service principal credentials as secrets in the key vault
    log "setting secrets arm-client-id and arm-client-secret in key vault ${KEY_VAULT_NAME}"
    az keyvault secret set --name "arm-client-id" --vault-name "${KEY_VAULT_NAME}" --value "${SP_APP_ID}"
    if [ $? -ne 0 ]; then
        err "Failed to set secret arm-client-id in key vault ${KEY_VAULT_NAME}"
        return 1
    fi

    az keyvault secret set --name "arm-client-secret" --vault-name "${KEY_VAULT_NAME}" --value "${SP_PASSWORD}"
    if [ $? -ne 0 ]; then
        err "Failed to set secret arm-client-secret in key vault ${KEY_VAULT_NAME}"
        return 1
    fi

    # Print the service principal secrets
    log "Service principal secrets created"
    return 0
}

function grant_access_to_service_principal() {

    # Get the service principal's objectId
    log "getting objectId for service principal ${SP_NAME}"
    SP_OBJECT_ID=$(az ad sp list --display-name "${SP_NAME}" --query "[].id" -o tsv)
    if [ $? -ne 0 ]; then
        err "Failed to get objectId for service principal ${SP_NAME}"
        return 1
    fi

    # Get the subscription id
    log "getting subscription id"
    SUBSCRIPTION_ID=$(az account show --query "id" -o tsv)
    if [ $? -ne 0 ]; then
        err "Failed to get subscription id"
        return 1
    fi

    # Check if the service principal is already a contributor to the subscription
    if [[ $(az role assignment list --assignee "${SP_OBJECT_ID}" --role "Contributor" --scope "/subscriptions/${SUBSCRIPTION_ID}" --query "[].id" -o tsv) ]]; then
        log "Service principal ${SP_NAME} is already a Contributor for subscription ${SUBSCRIPTION_ID}"
    else
        # Add the service principal as a Contributor for the subscription
        az role assignment create --assignee "${SP_OBJECT_ID}" --role "Contributor" --scope "/subscriptions/${SUBSCRIPTION_ID}"
        if [ $? -ne 0 ]; then
            err "Failed to add service principal ${SP_NAME} as a Contributor for subscription ${SUBSCRIPTION_ID}"
            return 1
        fi

        # Print a message confirming the role assignment
        log "Service principal ${SP_NAME} added as a Contributor for subscription ${SUBSCRIPTION_ID}"
    fi

    # Check if the service principal is already a user access administrator for the subscription.
    if [[ $(az role assignment list --assignee "${SP_OBJECT_ID}" --role "User Access Administrator" --scope "/subscriptions/${SUBSCRIPTION_ID}" --query "[].id" -o tsv) ]]; then
        log "Service principal ${SP_NAME} is already a User Access Administrator for subscription ${SUBSCRIPTION_ID}"
    else
        # Add the service principal as a User Access Administrator for the subscription
        az role assignment create --assignee "${SP_OBJECT_ID}" --role "User Access Administrator" --scope "/subscriptions/${SUBSCRIPTION_ID}"
        if [ $? -ne 0 ]; then
            err "Failed to add service principal ${SP_NAME} as a User Access Administrator for subscription ${SUBSCRIPTION_ID}"
            return 1
        fi

        # Print a message confirming the role assignment
        log "Service principal ${SP_NAME} added as a User Access Administrator for subscription ${SUBSCRIPTION_ID}"
    fi

    return 0
}

# Define variables
RESOURCE_GROUP="repro-project"
USER_NAME=$(az account show --query "user.name" -o tsv)
USER_ALIAS=$(az account show --query user.name -o tsv | cut -d '@' -f1)
SP_NAME="${USER_ALIAS}-actlabs"

# Create the key vault
ok "configuration started. This may take a few minutes..."
if create_keyvault; then
    log "Key vault setup complete"
else
    err "Failed to setup key vault"
    exit 1
fi

# Add secrets to the key vault
if create_service_principal; then
    log "Key vault secrets setup complete"
else
    err "Failed to setup key vault secrets"
    exit 1
fi

# Add the service principal as a contributor to the subscription
if grant_access_to_service_principal; then
    log "Service principal access setup complete"
else
    err "Failed to add service principal as a contributor to the subscription"
    exit 1
fi
ok "configuration complete"

sleep 2s
