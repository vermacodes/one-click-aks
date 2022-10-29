#!/bin/bash
terraform_directory=$1
root_directory=$2
resource_group_name=$3
storage_account_name=$4
container_name=$5
tf_state_file_name=$6

# Start at root directory
cd $root_directory

# Parameter input validation
if [ -z "$terraform_directory" ]; then
    echo "Directory name required. run like, /bin/bash apply.sh <directory-name>"
    exit 1
fi

cd $terraform_directory

echo $(pwd)

if [ $? -ne 0 ]; then
    echo "Looks like wrong directory name"
    exit 1
fi

# Validate if terraform in installed
dpkg -s terraform &> /dev/null

if [ $? -ne 0 ]; then
    echo "Terraform is not installed. Installation Instructions -> https://learn.hashicorp.com/tutorials/terraform/install-cli"
fi

terraform init \
-migrate-state \
-backend-config="resource_group_name=$resource_group_name" \
-backend-config="storage_account_name=$storage_account_name" \
-backend-config="container_name=$container_name" \
-backend-config="key=$tf_state_file_name"
terraform plan
#terraform apply -auto-approve