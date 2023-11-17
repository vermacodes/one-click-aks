#!/usr/bin/env bash

# These are shared functions for ARO labs.

function deployAROCluster() {

    # Set the cluster name, and network name variables
    ARO_CLUSTER_NAME="${PREFIX}-aro"

    az group show --name ${RESOURCE_GROUP} --output none >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        err "Resource Group not found. Skipped creating cluster."
        return 1
    fi

    # Deploy the cluster
    log "deploying aro cluster"
    az aro create \
        --resource-group ${RESOURCE_GROUP} \
        --name ${ARO_CLUSTER_NAME} \
        --location ${LOCATION} \
        --vnet ${VNET_NAME} \
        --master-subnet AROMasterSubnet \
        --worker-subnet AROWorkerSubnet \
        --no-wait
    if [ $? -ne 0 ]; then
        err "Command to create ARO Cluster failed."
        return 1
    fi

    # Wait for the cluster to be ready
    counter=0
    ok "waiting for cluster to be created. this can take several minutes, script will wait for an hour."
    while true; do
        status=$(az aro show --resource-group ${RESOURCE_GROUP} --name ${ARO_CLUSTER_NAME} --query provisioningState -o tsv)

        if [[ ${status} == "Succeeded" ]]; then
            ok "cluster created."
            break
        fi

        if [[ ${counter} -eq 3600 ]]; then
            err "enough wait.. the cluster is no ready yet. please check from portal"
            break
        fi

        counter=$((${counter} + 30))
        sleep 30

        if [[ ${status} == "Creating" ]]; then
            log "cluster state is still 'Creating'. Sleeping for 30 seconds. $((${counter} / 60)) minutes passed."
        else
            log "Wait time didn't finish and cluster state isn't 'Creating' anymore. $((${counter} / 60)) minutes passed."
        fi
    done

    # Get the cluster credentials
    log "cluster credentials"
    az aro list-credentials --resource-group ${RESOURCE_GROUP} --name ${ARO_CLUSTER_NAME}

    pass=$(az aro list-credentials -g ${RESOURCE_GROUP} -n ${ARO_CLUSTER_NAME} --query kubeadminPassword -o tsv)
    apiServer=$(az aro show -g ${RESOURCE_GROUP} -n ${ARO_CLUSTER_NAME} --query apiserverProfile.url -o tsv)
    apiServerIp=$(az aro show -g ${RESOURCE_GROUP} -n ${ARO_CLUSTER_NAME} --query apiserverProfile.ip -o tsv)

    ok "Login command -> oc login $apiServer -u kubeadmin -p $pass --insecure-skip-tls-verify"
}

function deleteAROCluster() {

    # Set the cluster name, and network name variables
    ARO_CLUSTER_NAME="${PREFIX}-aro"

    # Deploy the cluster
    log "deleting aro cluster"
    az aro delete \
        --resource-group ${RESOURCE_GROUP} \
        --name ${ARO_CLUSTER_NAME} \
        --yes \
        --no-wait
    if [ $? -ne 0 ]; then
        err "Command to delete ARO Cluster failed."
        return 1
    fi

    # Wait for the cluster to be ready
    counter=0
    ok "waiting for cluster to be deleted. this can take several minutes, script will wait for an hour."
    while true; do
        status=$(az aro show --resource-group ${RESOURCE_GROUP} --name ${ARO_CLUSTER_NAME} --query provisioningState -o tsv)

        if [[ ${status} != "Deleting" ]]; then
            ok "cluster deleted."
            break
        fi

        if [[ ${counter} -eq 3600 ]]; then
            err "enough wait.. the cluster is not deleted yet. please investigate"
            break
        fi

        counter=$((${counter} + 30))
        sleep 30

        if [[ ${status} == "Deleting" ]]; then
            log "cluster state is still 'Deleting'. Sleeping for 30 seconds. $((${counter} / 60)) minutes passed."
        else
            log "Wait time didn't finish and cluster state isn't 'Deleting' anymore. $((${counter} / 60)) minutes passed."
        fi
    done
}
