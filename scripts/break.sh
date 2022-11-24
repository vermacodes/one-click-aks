#!/bin/bash

function break_cluster() {

    # Deploy Ingress Controller.
    log "Deploying Ingress Controller"
    NAMESPACE=ingress-basic

    helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
    helm repo update

    helm install ingress-nginx ingress-nginx/ingress-nginx \
    --create-namespace \
    --namespace $NAMESPACE

    # This loop is to wait for 5 minutes to ensure the external ip was allocated to the service.
    for i in {1..11}; do
        log "Checking external ip - Attemp $i"
        if [[ $i -eq 11 ]]; then
            err "Not able to secure external ip"
            exit 1
        fi
        EXTERNAL_IP=$(kubectl get svc/ingress-nginx-controller -n ingress-basic -o json | jq -r .status.loadBalancer.ingress[0].ip)
        if [[ "$EXTERNAL_IP" != "" ]]; then
            log "External IP : $EXTERNAL_IP"
            break
        fi
        sleep 30s
    done

    # Adding NSG rule

    az network nsg rule create -g $RESOURCE_GROUP --nsg-name $NSG_NAME -n AllowAnyHTTPSInbound --priority 4096 \
    --source-address-prefixes '*' --source-port-ranges '*' \
    --destination-address-prefixes $EXTERNAL_IP/32 --destination-port-ranges 443 --access Deny \
    --protocol Tcp --description "Allow HTTPS" > /dev/null


    # Policy will create NSG automatically. That will break connection to the ingress controller.
    # This loop waits for that to happen for an hour.
    for i in {1..121}; do
        log "Customer doing stuff - $i"
        if [[ $i -eq 121 ]]; then
            err "Something went right"
            exit 1
        fi
        HTTP_CODE=$(timeout 5s curl -s -k -w '%{http_code}' https://$EXTERNAL_IP/healthz)

        if [[ $HTTP_CODE -ne 200 ]]; then
            log "Application in cluster is not accessible via ingress controller"
            log "I am expecting 200 OK response if you run curl -v https://$EXTERNAL_IP/healthz"
            log "Please help"
            exit 0
        fi
        sleep 30s
    done
    
    log "Checking HTTP status."
    log "curl -k -w '%{http_code}' https://$EXTERNAL_IP/healthz"
    HTTP_CODE=$(curl -s -k -w '%{http_code}' https://$EXTERNAL_IP/healthz)

    if [[ $HTTP_CODE -ne 200 ]]; then
        err "Not able to pass health status"
        exit 1
    fi

    log "Health status : $HTTP_CODE"

    log "az aks get-upgrades -g $RESOURCE_GROUP -n $CLUSTER_NAME -o table"

    #az aks scale -g $RESOURCE_GROUP -n $CLUSTER_NAME --node-count 10
    err "Issue description: AKS cluster scale operation failed"
    log "Cluster Name: $CLUSTER_NAME"
    log "Resource Group: $RESOURCE_GROUP"
}

##
## Script starts here.
##

#Initialize the environment.

# $ROOT_DIR/scripts/apply.sh $1 $2 $3 $4 $5 $6
source $ROOT_DIR/scripts/helper.sh && init

log "Breaking cluster."
break_cluster

# rm -rf .terraform/*.tfstate .terraform.lock.hcl