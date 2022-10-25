#!/bin/bash

# Validate if terraform in installed
dpkg -s terraform &> /dev/null

if [ $? -ne 0 ]; then
    echo "Terraform is not installed. Installation Instructions -> https://learn.hashicorp.com/tutorials/terraform/install-cli"
fi

# TODO: Add a section to pull credentials of this exact cluster based on the state
# thi is needed to delete in nginx ingress deployment before other resources could be destroyed.
# not sure if there is a better way.

terraform init
terraform destroy -auto-approve