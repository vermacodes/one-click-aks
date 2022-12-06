#!/usr/bin/env bash

# This is a template to generate break and validate scripts. 
# 
# All that is needed is to modify either validate() or break() functions in this script.
#
# Environmetn Variables that this script has access to.
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

function validate() {
    # Add your code here for validation
}

function break_cluster() {
    # Add your code here for break_cluster.
}

##
## Script starts here.
##

#Initialize the environment.
source $ROOT_DIR/scripts/helper.sh && init

log "Validating Cluster"

# call the method you added the code to.
validate