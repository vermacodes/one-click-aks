#!/bin/bash

# Validate if terraform in installed
dpkg -s terraform &> /dev/null

if [ $? -ne 0 ]; then
    echo "Terraform is not installed. Installation Instructions -> https://learn.hashicorp.com/tutorials/terraform/install-cli"
fi

terraform init
terraform destroy -auto-approve