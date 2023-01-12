#!/usr/bin/env bash

# Extension Script. 
# 
# All that is needed is to modify either validate(), extend() or destroy() functions in this script.
# To apply YAMLs you can crate functions and use formal like this. https://stackoverflow.com/a/54364063/2353460
#
#
#
# This script has access to all the terraform output variables in all CAPS.
# Some of those are as follows.
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
# 10.   Cluster Managed Service Identity ID
#           Name: CLUSTER_MSI_ID
#           Type: string
#           Expected Values: "" | "cluster_msi_id"
# 11.   Kubelet Managed Service Identity ID
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
#       Args: "string"
#       Example: log "this statement will be logged"
#
# 03.   Green (OK) Logging
#       ok()
#       Args: "string"
#       Example: ok "this statement will be logged as INFO log in green color"
#
# 03.   Error Logging
#       err()
#       Args: (String)
#       Example: err "this error occrured"
#

#####################################
#   DO NOT MODIFY ABOVE THIS LINE   #
#####################################

function validate() {
    # Add your code here for validation
    ok "nothing to validate"
}

function destroy() {
    # Add your code here to be executed before destruction
    ok "nothing to destroy"
}

function extend() {
    # Add your code here to be executed after apply
    ok "nothing to extend"
}

#####################################
#   DO NOT MODIFY BELOW THIS LINE   #
#####################################

##
## Script starts here.
##

#Initialize the environment.
source $ROOT_DIR/scripts/helper.sh && init

ok "begining of extension script"

# calls the method you added the code to.
if [[ ${SCRIPT_MODE} == "apply" ]]; then
    extend
elif [[ ${SCRIPT_MODE} == "destroy" ]]; then
    destroy
elif [[ ${SCRIPT_MODE} == "validate" ]]; then
    validate
fi

ok "end of extension script"