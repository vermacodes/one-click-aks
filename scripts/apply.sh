#!/bin/bash

# Start at root directory
cd $root_directory

# Parameter input validation
if [ -z "$terraform_directory" ]; then
    echo "Directory name required. run like, /bin/bash apply.sh <directory-name>"
    exit 1
fi

cd $terraform_directory

if [ $? -ne 0 ]; then
    echo "Looks like wrong directory name"
    exit 1
fi

# Validate if terraform in installed
dpkg -s terraform &> /dev/null

if [ $? -ne 0 ]; then
    echo "Terraform is not installed. Installation Instructions -> https://learn.hashicorp.com/tutorials/terraform/install-cli"
fi


# Printing the TF ENV
echo "Terraform Environment Variables"
echo ""
env | grep "TF_VAR"
echo ""


terraform init \
-migrate-state \
-backend-config="resource_group_name=$resource_group_name" \
-backend-config="storage_account_name=$storage_account_name" \
-backend-config="container_name=$container_name" \
-backend-config="key=$tf_state_file_name"
#terraform plan
terraform apply -auto-approve -refresh=true

rm -rf .terraform/ .terraform.lock.hcl