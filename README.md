# One Click AKS

## Introduction
This project helps you deploy AKS using different patterns using terraform.

## Requirements
- **Operating System** At this time we only have linux scripts available and thats why you need to use Linux environments. If you are using windows, you can [install WSL by following instructions here](https://docs.microsoft.com/en-us/windows/wsl/install). If you are using MacOS, it should work but never tested.
- **Terraform** As we will be using terraform to create resources, you need to [install terraform by following instructions here](https://learn.hashicorp.com/tutorials/terraform/install-cli).

## Instructions
- Clone [the git repository](https://github.com/vermacodes/one-click-aks) in your local system. If you dont have git installed, you can either [install git by following instructions here](https://docs.microsoft.com/en-us/devops/develop/git/install-and-set-up-git) or simply download ZIP of the code and unpack in your local system.
- You will see two following scripts in project's root directory.
    - **apply.sh** *This script is used to create the infrastucture*
    - destroy.sh *This script is used to destroy the infrascture*
- You can run these scripts in following format
    - `/bin/bash scriptname.sh pattern-name`
    - For example, `/bin/bash apply.sh aks-standard-lb-2`
- Be sure to destroy the infrastructure after you are done with your tests using destroy script.

## Patterns

|Name|Description|
------|----------
aks-standard-lb-2 | This deploys a public aks cluster with standard lb egress type|
aks-private-standard-lb | This deploys a private aks cluster with standard lb egress trype
aks-udr-firewall | This deploys private aks cluster with egress type userDefinedRouting. This uses Azure Firewall to restrict egress traffic and all [required egress traffic](https://docs.microsoft.com/en-us/azure/aks/limit-egress-traffic#required-outbound-network-rules-and-fqdns-for-aks-clusters) is allowed.
aks-udr-firewall-2 | **Under Construction.** This will replace aks-udr-firewall and will rely on newer terraform modules.
aks-standard-lb | *Deprecated*
