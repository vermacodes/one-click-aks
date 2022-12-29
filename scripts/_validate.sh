#!/usr/bin/env bash

# This is a template to generate extend and validate scripts. 
# 
# All that is needed is to modify either validate() or extend() functions in this script.
# To apply YAMLs you can crate functions and use formal like this. https://stackoverflow.com/a/54364063/2353460
#
#
#
# Environment Variables that this script has access to.
#
#
#
# 01.   Azure Container Regitry Name
#           Name : ACR_NAME
#           Type : string
#           Expected Values : "" | "name of the acr"
# 02.   AKS Pull Credentials Command
#           Name: AKS_LOGIN
#           Type: string
#           Expected Values: "az aks get-crendentails command"
# 03.   AKS Cluster Name
#           Name: CLUSTER_NAME
#           Type: string
#           Expected Values: "cluster-name"
# 04.   AKS Cluster Version
#           Name: CLUSTER_VERSION
#           Type: string
#           Expected Values: "1.23.12"
# 05.   Firewall Private IP
#           Name: FIREWALL_PRIVATE_IP
#           Type: string
#           Expected Values: "" | "0.0.0.0"
# 06.   Network Security Group Name
#           Name: NSG_NAME
#           Type: string
#           Expected Values: "" | "nsg_name"
# 07.   Location | Azure Region
#           Name: LOCATION
#           Type: string
#           Expected Values: "region"
# 08.   Resource Group Name
#           Name: RESOURCE_GROUP
#           Type: string
#           Expected Values: "resource_group_name"
# 09.   Virtual Network Name
#           Name: VNET_NAME
#           Type: string
#           Expected Values: "" | "vnet_name"
# 09.   Cluster Managed Service Identity ID
#           Name: CLUSTER_MSI_ID
#           Type: string
#           Expected Values: "" | "cluster_msi_id"
# 09.   Kubelet Managed Service Identity ID
#           Name: KUBELET_MSI_ID
#           Type: string
#           Expected Values: "" | "kubelet_msi_id"
#
#
#
# Shared functions that this script has access to.
#
#
# 01.   Loging
#       log()
#       Args: (string)
#       Example: log "this statemetn will be logged"
#
# 02.   Error Logging
#       err()
#       Args: (String)
#       Example: err "this error occrured"
#

function validate() {
    # Add your code here for validation
    echo ""
}

function extend() {
    # Pulling image down to the ACR.
}

##
## Script starts here.
##

#Initialize the environment.
source $ROOT_DIR/scripts/helper.sh && init

log "Validating Cluster"

# call the method you added the code to.
validate
