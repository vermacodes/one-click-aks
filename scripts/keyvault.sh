#!/bin/bash

# Function to check if keyvault exists
check_keyvault_exists() {
  keyvault_name="$1"
  resource_group="$2"
  
  az keyvault show --name "$keyvault_name" --resource-group "$resource_group" &>/dev/null
}

# Function to create keyvault
create_keyvault() {
  keyvault_name="$1"
  resource_group="$2"
  
  az keyvault create --name "$keyvault_name" --resource-group "$resource_group" --location "$LOCATION" --enable-soft-delete true --retention-days 90 &>/dev/null
}

# Function to grant current user full access to keyvault
grant_user_access() {
  keyvault_name="$1"
  resource_group="$2"
  
  user_object_id=$(az ad signed-in-user show --query objectId -o tsv)
  az keyvault set-policy --name "$keyvault_name" --resource-group "$resource_group" --object-id "$user_object_id" --secret-permissions get list set delete backup restore recover &>/dev/null
}

# Function to create or retrieve service principal
create_service_principal() {
  service_principal_name="$1"
  
  sp=$(az ad sp show --id "http://${service_principal_name}" -o json 2>/dev/null)
  
  if [[ -z $sp ]]; then
    sp=$(az ad sp create-for-rbac --name "$service_principal_name" --skip-assignment -o json)
  fi
  
  echo "$sp"
}

# Function to check if secret exists
check_secret_exists() {
  keyvault_name="$1"
  secret_name="$2"
  
  az keyvault secret show --name "$secret_name" --vault-name "$keyvault_name" &>/dev/null
}

# Function to create secret
create_secret() {
  keyvault_name="$1"
  secret_name="$2"
  secret_value="$3"
  
  az keyvault secret set --name "$secret_name" --vault-name "$keyvault_name" --value "$secret_value" &>/dev/null
}

# Main script
LOCATION="eastus"
RESOURCE_GROUP="repro-project"

# Get user alias
USER_ALIAS=$(az account show --query user.name -o tsv | cut -d '@' -f1)

# Generate keyvault name
KEYVAULT_NAME="kv-$RANDOM-$USER_ALIAS"

# Check if keyvault exists, create if necessary
if ! check_keyvault_exists "$KEYVAULT_NAME" "$RESOURCE_GROUP"; then
  create_keyvault "$KEYVAULT_NAME" "$RESOURCE_GROUP"
  grant_user_access "$KEYVAULT_NAME" "$RESOURCE_GROUP"
  echo "Keyvault created: $KEYVAULT_NAME"
fi

# Check if arm-client-id and arm-client-secret secrets exist
if check_secret_exists "$KEYVAULT_NAME" "arm-client-id" && check_secret_exists "$KEYVAULT_NAME" "arm-client-secret"; then
  echo "Secrets already exist, exiting."
  exit 0
fi

# Create or retrieve service principal
SERVICE_PRINCIPAL_NAME="${USER_ALIAS}_repro_project"
sp=$(create_service_principal "$SERVICE_PRINCIPAL_NAME")

# Set arm-client-id and arm-client-secret secrets
ARM_CLIENT_ID=$(echo "$sp" | jq -r '.appId')
ARM_CLIENT_SECRET=$(echo "$sp" | jq -r '.password')
create_secret "$KEYVAULT_NAME" "arm-client-id" "$ARM_CLIENT_ID"
create_secret "$KEYVAULT_NAME" "arm-client-secret" "$ARM_CLIENT_SECRET"

echo "Secrets created."
