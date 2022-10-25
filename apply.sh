#!/bin/bash


# Start at root directory
cd ../..

# Parameter input validation
if [ -z "$1" ]; then
    echo "Directory name required. run like, /bin/bash apply.sh <directory-name>"
    exit 1
fi

cd $1

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

terraform init
terraform plan
#terraform apply -auto-approve