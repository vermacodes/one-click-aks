#!/bin/bash

function validate() {

    NAMESPACE=ingress-basic
    log "Namespace : $NAMESPACE"

    log "Getting external IP"
    EXTERNAL_IP=$(kubectl get svc/ingress-nginx-controller -n ingress-basic -o json | jq -r .status.loadBalancer.ingress[0].ip)
    
    log "Validating"
    HTTP_CODE=$(timeout 3s curl -s -k -w '%{http_code}' https://$EXTERNAL_IP/healthz)

    if [[ $HTTP_CODE -ne 200 ]]; then
        err "Not fixed yet."
        exit 1
    fi

    log "Fixed. Good Job."
    exit 0
}

##
## Script starts here.
##

#Initialize the environment.
source $ROOT_DIR/scripts/helper.sh && init

log "Breaking cluster."
validate