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

function kubectlDelete() {
    kubectl delete deploy httpbin
    kubectl delete service httpbin
    kubectl delete ingress httpbin-ingress
}

function kubectlDeploy() {

cat <<EOF | kubectl create -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: httpbin
  labels:
    app: httpbin
spec:
  replicas: 1
  selector:
    matchLabels:
      app: httpbin
      role: frontend
  template:
    metadata:
      labels:
        app: httpbin
        role: frontend
    spec:
      containers:
        - name: httpbin
          image: ${ACR_NAME}.azurecr.io/test-images/httpbin:latest
          resources:
            requests:
              cpu: 500m
---
apiVersion: v1
kind: Service
metadata:
  name: httpbin
  labels:
    app: httpbin
spec:
  selector:
    app: httpbin
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: httpbin-ingress
  annotations:
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  rules:
  - host: "httpbin.example.com"
    http:
      paths:
        - path: /(.*)
          pathType: Prefix
          backend:
            service:
              name: httpbin
              port:
                number: 80
EOF
}

function extend() {
    # Pulling image down to the ACR.
    az acr import -g ${RESOURCE_GROUP} -n ${ACR_NAME} --source docker.io/kennethreitz/httpbin:latest -t "${ACR_NAME}.azurecr.io/test-images/httpbin:latest" --force

    # Deleting the role assignment
    az role assignment delete --assignee "${KUBELET_MSI_ID}" \
    --role "AcrPull" \
    --resource-group "${RESOURCE_GROUP}"

    kubectlDelete
    kubectlDeploy

    log "I am pretty sure the ACR pull will fail. I really hope script works though."
}

##
## Script starts here.
##

#Initialize the environment.
source $ROOT_DIR/scripts/helper.sh && init

log "Extending Cluster"

# call the method you added the code to.
extend