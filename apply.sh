#!/bin/bash


# Parameter input validation
if [ -z "$1" ]; then
    echo "Directory name required. run like, /bin/bash apply.sh <directory-name>"
    exit 1
fi

cd $1
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
terraform apply -auto-approve