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

gap() {
  echo >&1
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
    err "Please use azure cli to select the correct subscription and try again"
    return 1
  fi
}

# Function to check if a resource group exists
# If the resource group doesn't exist, create one
function create_resource_group() {
  # Check if the resource group exists
  RG_EXISTS=$(az group exists --name "${RESOURCE_GROUP}" --output tsv)

  if [[ "${RG_EXISTS}" == "true" ]]; then
    log "resource group ${RESOURCE_GROUP} already exists"
    return 0
  else
    log "creating resource group with name ${RESOURCE_GROUP}"

    # Ask the user for a location if one wasn't provided
    if [[ -z "${LOCATION}" ]]; then
      gap
      LOCATION=$(az account list-locations --query "[?metadata.regionType!='Logical' && metadata.physicalLocation!=null].name" -o tsv)
      echo "Please select a location (azure region) from the list below:"
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
      err "failed to create resource group ${RESOURCE_GROUP}"
      return 1
    else
      log "resource group ${RESOURCE_GROUP} created"
    fi
  fi

  return 0
}

# Function to check if a storage account exists in the resource group
# If the storage account doesn't exist, create one with a random name
function create_storage_account() {
  # Check if the storage account exists in the resource group
  SA_EXISTS=$(az storage account list --resource-group "${RESOURCE_GROUP}" --query "[].name" -o tsv)

  if [[ -n "${SA_EXISTS}" ]]; then
    log "storage account already exists with name ${SA_EXISTS}"
    STORAGE_ACCOUNT_NAME="$SA_EXISTS"
  else
    # Generate a random name for the storage account
    RANDOM_NAME=$(openssl rand -hex 4)
    STORAGE_ACCOUNT_NAME="${USER_ALIAS}sa${RANDOM_NAME}"

    log "creating storage account with name ${STORAGE_ACCOUNT_NAME} in resource group ${RESOURCE_GROUP}"
    # Create the storage account
    az storage account create --name "${STORAGE_ACCOUNT_NAME}" --resource-group "${RESOURCE_GROUP}" --sku Standard_LRS
    if [ $? -ne 0 ]; then
      err "failed to create storage account ${STORAGE_ACCOUNT_NAME}"
      return 1
    else
      log "storage account ${STORAGE_ACCOUNT_NAME} created"
    fi
  fi

  # get storage account key
  STORAGE_ACCOUNT_KEY=$(az storage account keys list --resource-group "${RESOURCE_GROUP}" --account-name "${STORAGE_ACCOUNT_NAME}" --query "[0].value" -o tsv)

  # check if a blob container named 'tfstate' exists in the storage account
  # if not create one
  log "checking if blob container tfstate exists in storage account ${STORAGE_ACCOUNT_NAME}"
  CONTAINER_EXISTS=$(az storage container exists --name "tfstate" --account-name "${STORAGE_ACCOUNT_NAME}" --account-key "${STORAGE_ACCOUNT_KEY}" --query "exists" -o tsv)
  if [[ "${CONTAINER_EXISTS}" == "true" ]]; then
    log "Blob container tfstate already exists in storage account ${STORAGE_ACCOUNT_NAME}"
  else
    log "Blob container tfstate does not exist in storage account ${STORAGE_ACCOUNT_NAME}, creating"
    az storage container create --name "tfstate" --account-name "${STORAGE_ACCOUNT_NAME}"
    if [ $? -ne 0 ]; then
      err "Failed to create blob container tfstate in storage account ${STORAGE_ACCOUNT_NAME}"
      return 1
    else
      log "Blob container tfstate created in storage account ${STORAGE_ACCOUNT_NAME}"
    fi
  fi

  # check if a blob container named 'labs' exists in the storage account
  # if not create one
  log "checking if blob container labs exists in storage account ${STORAGE_ACCOUNT_NAME}"
  CONTAINER_EXISTS=$(az storage container exists --name "labs" --account-name "${STORAGE_ACCOUNT_NAME}" --account-key "${STORAGE_ACCOUNT_KEY}" --query "exists" -o tsv)
  if [[ "${CONTAINER_EXISTS}" == "true" ]]; then
    log "Blob container labs already exists in storage account ${STORAGE_ACCOUNT_NAME}"
  else
    log "Blob container labs does not exist in storage account ${STORAGE_ACCOUNT_NAME}, creating"
    az storage container create --name "labs" --account-name "${STORAGE_ACCOUNT_NAME}"
    if [ $? -ne 0 ]; then
      err "Failed to create blob container labs in storage account ${STORAGE_ACCOUNT_NAME}"
      return 1
    else
      log "Blob container labs created in storage account ${STORAGE_ACCOUNT_NAME}"
    fi
  fi

  return 0
}

# Function to check if a key vault exists in a resource group
# If the key vault doesn't exist, create one with a random name
# and give the current user full access to secrets in the key vault
function create_keyvault() {
  # Check if the key vault exists in the resource group
  KEY_VAULT_NAME=$(az keyvault list --resource-group "${RESOURCE_GROUP}" --query "[].name" -o tsv)

  if [[ -n "${KEY_VAULT_NAME}" ]]; then
    log "key vault already exists with name ${KEY_VAULT_NAME}"

    ID_SECRET=$(az keyvault secret show --name "arm-client-id" --vault-name "${KEY_VAULT_NAME}" --query "value" -o tsv)

    # if the secrete contain 'output' then delete keyvault
    if [[ "${ID_SECRET}" == *"output"* ]]; then
      log "key vault ${KEY_VAULT_NAME} already exists but is not configured correctly"
      log "deleting key vault ${KEY_VAULT_NAME}"
      az keyvault delete --name "${KEY_VAULT_NAME}" --resource-group "${RESOURCE_GROUP}"
      if [ $? -ne 0 ]; then
        err "failed to delete key vault ${KEY_VAULT_NAME}"
        return 1
      else
        log "key vault ${KEY_VAULT_NAME} deleted"
      fi
    else
      return 0
    fi
  else
    # Generate a random name for the key vault
    RANDOM_NAME=$(openssl rand -hex 4)
    KEY_VAULT_NAME="${USER_ALIAS}-kv-${RANDOM_NAME}"

    log "creating key vault with name ${KEY_VAULT_NAME} in resource group ${RESOURCE_GROUP}"
    # Create the key vault
    az keyvault create --name "${KEY_VAULT_NAME}" --resource-group "${RESOURCE_GROUP}" --sku standard
    if [ $? -ne 0 ]; then
      err "failed to create key vault ${KEY_VAULT_NAME}"
      return 1
    else
      log "key vault ${KEY_VAULT_NAME} created"
    fi

    # Give the current user full access to secrets in the key vault
    log "granting full access to secrets in key vault ${KEY_VAULT_NAME} to user ${ARM_USER_PRINCIPAL_NAME}"
    az keyvault set-policy --name "${KEY_VAULT_NAME}" --resource-group "${RESOURCE_GROUP}" --upn "${ARM_USER_PRINCIPAL_NAME}" --secret-permissions get set list delete backup restore recover purge
    if [ $? -ne 0 ]; then
      err "failed to set policy for key vault ${KEY_VAULT_NAME}"
      return 1
    else
      log "policy set for key vault ${KEY_VAULT_NAME}"
    fi
  fi

  return 0
}

# Function to create a service principal and set its credentials as secrets in the key vault
function create_service_principal() {

  KEY_VAULT_NAME=$(az keyvault list --resource-group "${RESOURCE_GROUP}" --query "[].name" -o tsv)
  if [ $? -ne 0 ]; then
    err "failed to find key vault in resource group ${RESOURCE_GROUP}"
    return 1
  fi

  # Check if the arm-client-id and arm-client-secret secrets exist in the key vault
  # Get the secrets from the key vault
  # Uncomment lines below to not reset credentials if they already exist
  ID_SECRET=$(az keyvault secret show --name "arm-client-id" --vault-name "${KEY_VAULT_NAME}" --query "value" -o tsv)
  SECRET_SECRET=$(az keyvault secret show --name "arm-client-secret" --vault-name "${KEY_VAULT_NAME}" --query "value" -o tsv)

  if [[ -n "${ID_SECRET}" && -n "${SECRET_SECRET}" ]]; then
    log "secrets arm-client-id and arm-client-secret already exist in key vault ${KEY_VAULT_NAME}"
    log "to reset the credentials, delete the key vault and run this script again"
    return 0
  fi

  SP_APP_ID=$(az ad sp list --display-name "${SP_NAME}" --query "[].appId" -o tsv)

  if [[ -n "${SP_APP_ID}" ]]; then
    log "service principal already exists with appId ${SP_APP_ID}"

    # Reset the password for the existing service principal
    log "resetting password for service principal ${SP_NAME}"
    SP_PASSWORD=$(az ad sp credential reset --id "${SP_APP_ID}" --query "password" -o tsv)
    if [ $? -ne 0 ]; then
      err "failed to reset password for service principal ${SP_NAME}"
      return 1
    else
      log "password reset for service principal ${SP_NAME}"
    fi

  else
    # Create the service principal
    log "creating service principal ${SP_NAME}"
    SP_PASSWORD=$(az ad sp create-for-rbac --name "${SP_NAME}" --skip-assignment --query "password" -o tsv)
    if [ $? -ne 0 ]; then
      err "failed to create service principal ${SP_NAME}"
      return 1
    fi

    SP_APP_ID=$(az ad sp list --display-name "${SP_NAME}" --query "[].appId" -o tsv)

    # Print the service principal credentials
    log "service principal created with appId ${SP_APP_ID} and password REDACTED"
  fi

  # Set the service principal credentials as secrets in the key vault
  log "setting secrets arm-client-id and arm-client-secret in key vault ${KEY_VAULT_NAME}"
  az keyvault secret set --name "arm-client-id" --vault-name "${KEY_VAULT_NAME}" --value "${SP_APP_ID}" --output none
  if [ $? -ne 0 ]; then
    err "failed to set secret arm-client-id in key vault ${KEY_VAULT_NAME}"
    return 1
  fi

  az keyvault secret set --name "arm-client-secret" --vault-name "${KEY_VAULT_NAME}" --value "${SP_PASSWORD}" --output none
  if [ $? -ne 0 ]; then
    err "failed to set secret arm-client-secret in key vault ${KEY_VAULT_NAME}"
    return 1
  fi

  # Print the service principal secrets
  log "service principal secrets created"
  return 0
}

function grant_access_to_service_principal() {

  # Get the service principal's objectId
  SP_OBJECT_ID=$(az ad sp list --display-name "${SP_NAME}" --query "[].id" -o tsv)
  if [ $? -ne 0 ]; then
    err "Failed to get objectId for service principal ${SP_NAME}"
    return 1
  fi

  # Check if the service principal is already a contributor to the subscription
  if [[ $(az role assignment list --assignee "${SP_OBJECT_ID}" --role "Contributor" --scope "/subscriptions/${ARM_SUBSCRIPTION_ID}" --query "[].id" -o tsv) ]]; then
    log "Service principal ${SP_NAME} is already a Contributor for subscription ${ARM_SUBSCRIPTION_ID}"
  else
    # Add the service principal as a Contributor for the subscription
    az role assignment create --assignee "${SP_OBJECT_ID}" --role "Contributor" --scope "/subscriptions/${ARM_SUBSCRIPTION_ID}"
    if [ $? -ne 0 ]; then
      err "Failed to add service principal ${SP_NAME} as a Contributor for subscription ${ARM_SUBSCRIPTION_ID}"
      return 1
    fi

    # Print a message confirming the role assignment
    log "Service principal ${SP_NAME} added as a Contributor for subscription ${ARM_SUBSCRIPTION_ID}"
  fi

  # Check if the service principal is already a user access administrator for the subscription.
  if [[ $(az role assignment list --assignee "${SP_OBJECT_ID}" --role "User Access Administrator" --scope "/subscriptions/${ARM_SUBSCRIPTION_ID}" --query "[].id" -o tsv) ]]; then
    log "Service principal ${SP_NAME} is already a User Access Administrator for subscription ${ARM_SUBSCRIPTION_ID}"
  else
    # Add the service principal as a User Access Administrator for the subscription
    az role assignment create --assignee "${SP_OBJECT_ID}" --role "User Access Administrator" --scope "/subscriptions/${ARM_SUBSCRIPTION_ID}"
    if [ $? -ne 0 ]; then
      err "Failed to add service principal ${SP_NAME} as a User Access Administrator for subscription ${ARM_SUBSCRIPTION_ID}"
      return 1
    fi

    # Print a message confirming the role assignment
    log "Service principal ${SP_NAME} added as a User Access Administrator for subscription ${ARM_SUBSCRIPTION_ID}"
  fi

  return 0
}

function deploy_azure_container_instance() {
  az container create --resource-group $RESOURCE_GROUP --name $ACI_NAME --image $ACI_IMAGE --dns-name-label $ACI_DNS_NAME --ports 80 --location $LOCATION --subscription $ARM_SUBSCRIPTION_ID --environment-variables
}

# This script deploys Azure WebApp and add Application Settings.
function deploy_webapp() {

  # Check if webapp already exists, if yes then delete it.
  az webapp show --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --subscription $ARM_SUBSCRIPTION_ID >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    log "WebApp ${WEBAPP_NAME} already exists, deleting it"
    az webapp delete \
      --name $WEBAPP_NAME \
      --resource-group $RESOURCE_GROUP \
      --subscription $ARM_SUBSCRIPTION_ID 2>&1
    if [ $? -ne 0 ]; then
      err "Failed to delete existing WebApp"
      return 1
    fi

    log "Please wait..."

    # Loop until webapp is deleted
    while true; do
      az webapp show --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --subscription $ARM_SUBSCRIPTION_ID >/dev/null 2>&1
      if [ $? -ne 0 ]; then
        break
      fi
      log "Waiting for WebApp to be deleted"
      sleep 5
    done
  fi

  # Check if app plan already exists
  az appservice plan show --name $APP_SERVICE_PLAN_NAME --resource-group $RESOURCE_GROUP --subscription $ARM_SUBSCRIPTION_ID >/dev/null 2>&1
  if [ $? -ne 0 ]; then
    # Creating App Service Plan
    az appservice plan create \
      --name $APP_SERVICE_PLAN_NAME \
      --resource-group $RESOURCE_GROUP \
      --subscription $ARM_SUBSCRIPTION_ID \
      --sku B3 \
      --is-linux --debug 2>&1

    if [ $? -ne 0 ]; then
      err "Failed to create App Service Plan"
      return 1
    fi
  fi

  # Deploying WebApp from Docker Image.
  az webapp create \
    --name $WEBAPP_NAME \
    --resource-group $RESOURCE_GROUP \
    --subscription $ARM_SUBSCRIPTION_ID \
    --plan $APP_SERVICE_PLAN_NAME \
    --deployment-container-image-name $DOCKER_IMAGE --debug 2>&1

  # sleep 30s

  # # if this fails then try for 2 more times in loop
  # for i in {1..5}; do
  #   if [ $? -ne 0 ]; then
  #     log "Failed to deploy WebApp, trying again"
  #     az webapp create \
  #       --name $WEBAPP_NAME \
  #       --resource-group $RESOURCE_GROUP \
  #       --subscription $ARM_SUBSCRIPTION_ID \
  #       --plan $APP_SERVICE_PLAN_NAME \
  #       --deployment-container-image-name $DOCKER_IMAGE >/dev/null 2>&1

  #     sleep 30s
  #   else
  #     log "WebApp deployed successfully"
  #     break
  #   fi
  # done

  if [ $? -ne 0 ]; then
    err "Failed to deploy WebApp"

    # Deleting App Service Plan
    az appservice plan delete \
      --name $APP_SERVICE_PLAN_NAME \
      --resource-group $RESOURCE_GROUP \
      --subscription $ARM_SUBSCRIPTION_ID \
      --yes >/dev/null 2>&1
    return 1
  fi

  # Adding Application Settings
  az webapp config appsettings set \
    --name $WEBAPP_NAME \
    --resource-group $RESOURCE_GROUP \
    --subscription $ARM_SUBSCRIPTION_ID \
    --settings \
    ARM_CLIENT_ID=$ARM_CLIENT_ID \
    ARM_CLIENT_SECRET="$ARM_CLIENT_SECRET" \
    ARM_SUBSCRIPTION_ID=$ARM_SUBSCRIPTION_ID \
    ARM_TENANT_ID=$ARM_TENANT_ID \
    ARM_USER_PRINCIPAL_NAME=$ARM_USER_PRINCIPAL_NAME \
    LOG_LEVEL=$LOG_LEVEL \
    AUTH_TOKEN_ISS="https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/v2.0" \
    AUTH_TOKEN_AUD="00399ddd-434c-4b8a-84be-d096cff4f494" \
    WEBSITES_PORT=80 2>&1

  if [ $? -ne 0 ]; then
    err "Failed to add Application Settings"

    # Deleting WebApp
    az webapp delete \
      --name $WEBAPP_NAME \
      --resource-group $RESOURCE_GROUP \
      --subscription $ARM_SUBSCRIPTION_ID >/dev/null 2>&1

    # Deleting App Service Plan
    az appservice plan delete \
      --name $APP_SERVICE_PLAN_NAME \
      --resource-group $RESOURCE_GROUP \
      --subscription $ARM_SUBSCRIPTION_ID \
      --yes >/dev/null 2>&1
    return 1
  fi

  # add health check
  az webapp config set \
    --name $WEBAPP_NAME \
    --resource-group $RESOURCE_GROUP \
    --subscription $ARM_SUBSCRIPTION_ID \
    --generic-configurations '{"healthCheckPath":"/'status'"}' \
    >/dev/null 2>&1

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
  key_vault_name=$(az keyvault list --resource-group "${RESOURCE_GROUP}" --query "[].name" -o tsv)

  # Get a list of all secrets in the Key Vault
}

############################################################
# Script starts here                                       #
############################################################

# Confirm subscription
# gap
# if ! confirm_subscription; then
#   err "Failed to confirm subscription"
#   exit 1
# fi

# setting known variables.
gap
# gather input parameters
# -t tag
# -d debug

while getopts ":t:d" opt; do
  case $opt in
  t)
    TAG=$OPTARG
    ;;
  d)
    DEBUG=true
    ;;
  \?)
    echo "Invalid option: -$OPTARG" >&2
    ;;
  esac
done

if [ -z "${TAG}" ]; then
  TAG="latest"
fi

if [ ${DEBUG} ]; then
  export LOG_LEVEL="-4"
else
  export LOG_LEVEL="0"
fi

log "🏷️ TAG = ${TAG}"
log "🪵 LEVEL = ${LOG_LEVEL}"

gap
log "📝 setting variables"
DOCKER_IMAGE="ashishvermapu/repro:${TAG}"
RESOURCE_GROUP="repro-project"

ARM_SUBSCRIPTION_ID=$(az account show --query id --output tsv)
if [ $? -ne 0 ]; then
  err "Failed to get subscription id from az cli"
  exit 1
fi

ARM_TENANT_ID=$(az account show --query tenantId --output tsv)
if [ $? -ne 0 ]; then
  err "Failed to get tenant id from az cli"
  exit 1
fi

ARM_USER_PRINCIPAL_NAME=$(az ad signed-in-user show --query "userPrincipalName" -o tsv)
if [ $? -ne 0 ]; then
  err "failed to get user name"
  exit 1
fi

# accomodate new Microsoft non-production tenant.
# if ARM_USER_PRINCIPAL_NAME contains fdpo.onmicrosoft.com then curt different part
if [[ "${ARM_USER_PRINCIPAL_NAME}" == *"fdpo.onmicrosoft.com"* ]]; then
  USER_ALIAS=$(echo ${ARM_USER_PRINCIPAL_NAME} | cut -d '_' -f1)
else
  USER_ALIAS=$(echo ${ARM_USER_PRINCIPAL_NAME} | cut -d '@' -f1)
fi

SP_NAME="${USER_ALIAS}-actlabs"
APP_SERVICE_PLAN_NAME="${USER_ALIAS}-app-service-plan-actlabs"

# if ARM_USER_PRINCIPAL_NAME contains fdpo.onmicrosoft.com then curt different part
if [[ "${ARM_USER_PRINCIPAL_NAME}" == *"fdpo.onmicrosoft.com"* ]]; then
  WEBAPP_NAME="${USER_ALIAS}-webapp-actlabs-fdpo"
else
  WEBAPP_NAME="${USER_ALIAS}-webapp-actlabs"
fi

# if ARM_USER_PRINCIPAL_NAME contains fdpo.onmicrosoft.com then remove it and add microsoft.com
# this is done to accomodate new Microsoft non-production tenant.
if [[ "${ARM_USER_PRINCIPAL_NAME}" == *"fdpo.onmicrosoft.com"* ]]; then
  ARM_USER_PRINCIPAL_NAME=$(echo ${ARM_USER_PRINCIPAL_NAME} | cut -d '_' -f1)
  ARM_USER_PRINCIPAL_NAME="${ARM_USER_PRINCIPAL_NAME}@microsoft.com"
fi

# Create the resource group
gap
log "📁 resource group"
if ! create_resource_group; then
  exit 1
fi

# Create the storage account
gap
log "📦 storage account"
if ! create_storage_account; then
  exit 1
fi

# Create the key vault
gap
log "🔑 key vault"
if ! create_keyvault; then
  exit 1
fi

# Add secrets to the key vault
gap
log "🤖 Service Principal"
if ! create_service_principal; then
  exit 1
fi

# Add the service principal as a contributor to the subscription
gap
log "🔐 Service Principal Access"
if ! grant_access_to_service_principal; then
  exit 1
fi

# Get the name of the Key Vault in the resource group
export key_vault_name=$(az keyvault list --resource-group "${RESOURCE_GROUP}" --query "[].name" -o tsv)
if [ $? -ne 0 ]; then
  err "Failed to get key vault name in resource group ${RESOURCE_GROUP}"
  exit 1
fi

# This script deploys Azure WebApp and add Application Settings.
gap
log "🚀 Deploying WebApp"

ARM_CLIENT_ID=$(az keyvault secret show --vault-name $key_vault_name --name "arm-client-id" --query "value" -o tsv)
if [ $? -ne 0 ]; then
  err "Failed to get secret arm-client-id from key vault ${key_vault_name}"
  exit 1
fi
ARM_CLIENT_SECRET=$(az keyvault secret show --vault-name $key_vault_name --name "arm-client-secret" --query "value" -o tsv)
if [ $? -ne 0 ]; then
  err "Failed to get secret arm-client-secret from key vault ${key_vault_name}"
  exit 1
fi

# Create the App Service Plan
if deploy_webapp; then
  log "Successfully deployed WebApp"
else
  err "Failed to deploy WebApp"
  exit 1
fi

# Get the default domain of webapp
log "getting default domain of webapp"
export default_domain=$(az webapp show --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostName" -o tsv)
if [ $? -ne 0 ]; then
  err "Failed to get default domain of webapp"
  exit 1
fi
log "Endpoint: https://$default_domain"

# Verify the webapp is running
# Use curl to verify the webapp is running; keep trying for 5 minutes, 10 seconds apart
log "verifying webapp is running. this will take just a few moments. please wait..."
curl --silent --fail --show-error --max-time 10 --retry 30 --retry-delay 10 https://$default_domain/status >/dev/null 2>&1
if [ $? -ne 0 ]; then
  err "Failed to verify webapp is running"
  exit 1
fi
log ""
log "WebApp is running"

ok "WebApp is now running and server endpoint is https://$default_domain. Please go to https://actlabs.azureedge.net/settings to configure server endpont."
