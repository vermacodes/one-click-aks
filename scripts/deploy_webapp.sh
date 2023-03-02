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

# Function to ask user if current subscription is correct
# user must hit enter to continue, any other input will exit the script
function confirm_subscription() {
  # Get the current subscription
  CURRENT_SUBSCRIPTION=$(az account show --query "name" -o tsv)

  # Ask the user if the current subscription is correct
  echo -en "Is the current subscription ${GREEN}${CURRENT_SUBSCRIPTION}${NC} correct? (y/n) "
  read -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    err "Please select the correct subscription and try again"
    exit 1
  fi
}

# Function to check if a resource group exists
# If the resource group doesn't exist, create one
function create_resource_group() {
  # Check if the resource group exists
  log "checking if resource group ${RESOURCE_GROUP} exists"
  RG_EXISTS=$(az group exists --name "${RESOURCE_GROUP}")

  if [[ "${RG_EXISTS}" == "true" ]]; then
    log "Resource group ${RESOURCE_GROUP} already exists"
    return 0
  else
    log "resource group does not exist, creating with name ${RESOURCE_GROUP}"

    # Ask the user for a location if one wasn't provided
    if [[ -z "${LOCATION}" ]]; then
      log "No location provided, asking user for location"
      LOCATION=$(az account list-locations --query "[].name" -o tsv)
      echo "Please select a location from the list below:"
      select LOCATION in ${LOCATION}; do
        if [[ -n "${LOCATION}" ]]; then
          break
        else
          echo "Invalid selection, please try again"
        fi
      done
    fi

    # Create the resource group
    az group create --name "${RESOURCE_GROUP}" --location "${LOCATION}"
    if [ $? -ne 0 ]; then
      err "Failed to create resource group ${RESOURCE_GROUP}"
      return 1
    else
      log "Resource group ${RESOURCE_GROUP} created"
    fi
  fi

  return 0
}

# Function to check if a storage account exists in the resource group
# If the storage account doesn't exist, create one with a random name
function create_storage_account() {
  # Check if the storage account exists in the resource group
  log "checking if storage account exists in resource group ${RESOURCE_GROUP}"
  SA_EXISTS=$(az storage account list --resource-group "${RESOURCE_GROUP}" --query "[].name" -o tsv)

  if [[ -n "${SA_EXISTS}" ]]; then
    log "Storage account already exists with name ${SA_EXISTS}"
    return 0
  else
    # Generate a random name for the storage account
    RANDOM_NAME=$(openssl rand -hex 4)
    STORAGE_ACCOUNT_NAME="${USER_ALIAS}sa${RANDOM_NAME}"

    log "storage account does not exist, creating with name ${STORAGE_ACCOUNT_NAME} in resource group ${RESOURCE_GROUP}"
    # Create the storage account
    az storage account create --name "${STORAGE_ACCOUNT_NAME}" --resource-group "${RESOURCE_GROUP}" --sku Standard_LRS
    if [ $? -ne 0 ]; then
      err "Failed to create storage account ${STORAGE_ACCOUNT_NAME}"
      return 1
    else
      log "Storage account ${STORAGE_ACCOUNT_NAME} created"
    fi
  fi

  return 0
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
  # Uncomment lines below to not reset credentials if they already exist
  ID_SECRET=$(az keyvault secret show --name "arm-client-id" --vault-name "${KEY_VAULT_NAME}" --query "value" -o tsv)
  SECRET_SECRET=$(az keyvault secret show --name "arm-client-secret" --vault-name "${KEY_VAULT_NAME}" --query "value" -o tsv)

  if [[ -n "${ID_SECRET}" && -n "${SECRET_SECRET}" ]]; then
    log "Secrets arm-client-id and arm-client-secret already exist in key vault ${KEY_VAULT_NAME}"
    return 0
  fi

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

# This script deploys Azure WebApp and add Application Settings.
function deploy_webapp() {
  # Creating App Service Plan
  az appservice plan create \
    --name $app_service_plan_name \
    --resource-group $resource_group_name \
    --subscription $ARM_SUBSCRIPTION_ID \
    --sku B3 \
    --is-linux

  if [ $? -ne 0 ]; then
    err "Failed to create App Service Plan"
    return 1
  fi

  # Deploying WebApp from Docker Image.
  az webapp create \
    --name $webapp_name \
    --resource-group $resource_group_name \
    --subscription $ARM_SUBSCRIPTION_ID \
    --plan $app_service_plan_name \
    --deployment-container-image-name $docker_image_name

  if [ $? -ne 0 ]; then
    err "Failed to deploy WebApp"

    # Deleting App Service Plan
    az appservice plan delete \
      --name $app_service_plan_name \
      --resource-group $resource_group_name \
      --subscription $ARM_SUBSCRIPTION_ID \
      --yes
    return 1
  fi

  # Adding Application Settings
  az webapp config appsettings set \
    --name $webapp_name \
    --resource-group $resource_group_name \
    --subscription $ARM_SUBSCRIPTION_ID \
    --settings \
    ARM_CLIENT_ID=$ARM_CLIENT_ID \
    ARM_CLIENT_SECRET=$ARM_CLIENT_SECRET \
    ARM_SUBSCRIPTION_ID=$ARM_SUBSCRIPTION_ID \
    ARM_TENANT_ID=$ARM_TENANT_ID \
    ARM_USER_PRINCIPAL_NAME=$ARM_USER_PRINCIPAL_NAME \
    WEBSITE_PORT=80

  if [ $? -ne 0 ]; then
    err "Failed to add Application Settings"

    # Deleting WebApp
    az webapp delete \
      --name $webapp_name \
      --resource-group $resource_group_name \
      --subscription $ARM_SUBSCRIPTION_ID \
      --yes

    # Deleting App Service Plan
    az appservice plan delete \
      --name $app_service_plan_name \
      --resource-group $resource_group_name \
      --subscription $ARM_SUBSCRIPTION_ID \
      --yes
    return 1
  fi

  # add health check
  az webapp config set \
    --name $webapp_name \
    --resource-group $resource_group_name \
    --subscription $ARM_SUBSCRIPTION_ID \
    --generic-configurations '{"healthCheckPath":"/'status'"}'

  return 0
}

# function to get secrets from keyvault and set them as environment variables
# this replaces (-) with (_) and converts to uppercase
function secrets_to_env_variables() {
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

function get_secrets_from_keyvault() {
  # Get the name of the Key Vault in the resource group
  key_vault_name=$(az keyvault list --resource-group "${resource_group_name}" --query "[].name" -o tsv)

  # Get a list of all secrets in the Key Vault
}

############################################################
# Script starts here                                       #
############################################################

# Confirm subscription
if confirm_subscription; then
  log "Subscription confirmed"
else
  err "Failed to confirm subscription"
  exit 1
fi

# setting known variables.
log "Setting known variables"
export resource_group_name="repro-project"
export docker_image_name="ashishvermapu/repro"
RESOURCE_GROUP="repro-project"
USER_NAME=$(az account show --query "user.name" -o tsv)
USER_ALIAS=$(az account show --query user.name -o tsv | cut -d '@' -f1)
SP_NAME="${USER_ALIAS}-actlabs"

# Create the resource group
ok "configuration started. This may take a few minutes..."
if create_resource_group; then
  log "Resource group setup complete"
else
  err "Failed to setup resource group"
  exit 1
fi

# Create the storage account
if create_storage_account; then
  log "Storage account setup complete"
else
  err "Failed to setup storage account"
  exit 1
fi

# Create the key vault
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

# Get user alias
user_alias=$(az ad signed-in-user show --query "userPrincipalName" -o tsv | cut -d "@" -f 1)

export app_service_plan_name="${user_alias}-app-service-plan-$(openssl rand -hex 3)"
export webapp_name="${user_alias}-webapp-$(openssl rand -hex 3)"

# Get the name of the Key Vault in the resource group
log "Getting Key Vault name"
export key_vault_name=$(az keyvault list --resource-group "${resource_group_name}" --query "[].name" -o tsv)
if [ $? -ne 0 ]; then
  err "Failed to get key vault name in resource group ${resource_group_name}"
  exit 1
fi

# This script deploys Azure WebApp and add Application Settings.
log "getting secrets from keyvault"
export ARM_CLIENT_ID=$(az keyvault secret show --vault-name $key_vault_name --name "arm-client-id" --query "value" -o tsv)
if [ $? -ne 0 ]; then
  err "Failed to get secret arm-client-id from key vault ${key_vault_name}"
  exit 1
fi
export ARM_CLIENT_SECRET=$(az keyvault secret show --vault-name $key_vault_name --name "arm-client-secret" --query "value" -o tsv)
if [ $? -ne 0 ]; then
  err "Failed to get secret arm-client-secret from key vault ${key_vault_name}"
  exit 1
fi

log "getting subscription id and tenant id from az cli"
export ARM_SUBSCRIPTION_ID=$(az account show --output json | jq -r .id)
if [ $? -ne 0 ]; then
  err "Failed to get subscription id from az cli"
  exit 1
fi
export ARM_TENANT_ID=$(az account show --output json | jq -r .tenantId)
if [ $? -ne 0 ]; then
  err "Failed to get tenant id from az cli"
  exit 1
fi
export ARM_USER_PRINCIPAL_NAME=$(az account show --output json | jq -r .user.name)
if [ $? -ne 0 ]; then
  err "Failed to get user principal name from az cli"
  exit 1
fi

log "deploying webapp"
if deploy_webapp; then
  ok "Successfully deployed WebApp"
else
  err "Failed to deploy WebApp"
  exit 1
fi

# Get the default domain of webapp
log "getting default domain of webapp"
export default_domain=$(az webapp show --name $webapp_name --resource-group $resource_group_name --query "defaultHostName" -o tsv)
if [ $? -ne 0 ]; then
  err "Failed to get default domain of webapp"
  exit 1
fi
log "Endpoint: https://$default_domain"

# Verify the webapp is running
# Use curl to verify the webapp is running; keep trying for 5 minutes, 10 seconds apart
log "verifying webapp is running"
curl --silent --fail --show-error --max-time 10 --retry 30 --retry-delay 10 https://$default_domain/status
if [ $? -ne 0 ]; then
  err "Failed to verify webapp is running"
  exit 1
fi
log ""
log "WebApp is running"

ok "WebApp is now running and server endpoint is https://$default_domain. Please go to https://actlabs.azureedge.net/settings to configure server endpont."
