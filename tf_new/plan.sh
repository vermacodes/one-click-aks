#!/bin/bash

resource_group_name=$1
storage_account_name=$2
container_name=$3
tf_state_file_name=$4

# Validate if terraform in installed
dpkg -s terraform &> /dev/null

if [ $? -ne 0 ]; then
    echo "Terraform is not installed. Installation Instructions -> https://learn.hashicorp.com/tutorials/terraform/install-cli"
fi

echo $resource_group_name
echo $storage_account_name
echo $container_name
echo $tf_state_file_name

terraform init \
-migrate-state \
-backend-config="resource_group_name=$resource_group_name" \
-backend-config="storage_account_name=$storage_account_name" \
-backend-config="container_name=$container_name" \
-backend-config="key=$tf_state_file_name"
terraform plan
#terraform apply -auto-approve -refresh=true