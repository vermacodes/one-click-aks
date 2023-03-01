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
export docker_image_name="actlab.azurecr.io/repro:beta"

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
ok "Endpoint: https://$default_domain"

# Verify the webapp is running
# Use curl to verify the webapp is running; keep trying for 5 minutes, 10 seconds apart
log "verifying webapp is running"
curl --silent --fail --show-error --max-time 10 --retry 30 --retry-delay 10 https://$default_domain/status
if [ $? -ne 0 ]; then
  err "Failed to verify webapp is running"
  exit 1
fi
ok "WebApp is running"
