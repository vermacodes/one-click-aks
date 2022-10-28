#!/bin/bash

# Start at root directory.
cd $2

# Parameter input validation
if [ -z "$1" ]
then
    echo "Directory name required. run like, /bin/bash apply.sh <directory-name>"
    exit 1
fi

cd $1

# Validate if terraform in installed
dpkg -s terraform &> /dev/null

if [ $? -ne 0 ]; then
    echo "Terraform is not installed. Installation Instructions -> https://learn.hashicorp.com/tutorials/terraform/install-cli"
fi

# TODO: Add a section to pull credentials of this exact cluster based on the state
# thi is needed to delete in nginx ingress deployment before other resources could be destroyed.
# not sure if there is a better way.

# terraform init
terraform destroy -auto-approve