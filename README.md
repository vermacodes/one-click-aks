# One Click AKS

## Introduction
This project helps you deploy AKS using different patterns using terraform.

## Requirements
- **Linux** At this time you need to use Linux environments. If you are using windows, you can [install WSL by following instructions here](https://docs.microsoft.com/en-us/windows/wsl/install).
- **Terraform** As we will be using terraform to create resources, you need to [install terraform by following instructions here](https://learn.hashicorp.com/tutorials/terraform/install-cli).

## Instructions
- Clone [the git repository](https://github.com/vermacodes/one-click-aks) in your local system. If you dont have git installed, you can either [install git by following instructions here](https://docs.microsoft.com/en-us/devops/develop/git/install-and-set-up-git) or simply download ZIP of the code and unpack in your local system.
- You will see two following scripts in project's root directory.
    - **apply.sh** *This script is used to create the infrastucture*
    - destroy.sh *This script is used to destroy the infrascture*
- You can run these scripts in following format
    - `/bin/bash scriptname.sh pattern-name`
    - For example, `/bin/bash apply.sh aks-standard-lb-2`
- Be sure to destroy the infrastucre after you are done with your tests using destroy script.

## Patterns

|Name|Description|
------|----------
aks-standard-lb-2 | This deploys a public aks cluster with standard lb egress type|
