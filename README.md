# One Click AKS: Simplest way to deploy Complex AKS Cluster

Deploying Azure Kubernetes Cluster is really easy. You can create production grade cluster with couple CLI commands. So what this project brings to the table you ask.
There are hundereds of ways that an AKS cluster can be deployed in and then thousands more to configure and meet your unique requirements. If you have to deploy AKS with differnet configurations over and over again its no more an easy task. Along comes this project.
This project runs locally on your computer and deploys AKS cluster in many different ways. (not all)

## Getting Started

To get started, headcover to [ACT Labs Start](https://actlabs.azureedge.net/start) page and follow the simple setup wizard.

This setup wizard will help you with following.

- Running server on your computer.
- Select your Azure Subscription.
- Authenticate Azure CLI
- Create Storage Account
  - Storage Account will get a random generated name.
  - You can see this storage account name in settings.
  - This storage account will be created in a resource group named 'repro-project' in your selected subscription.
  - You will see that two containers are created in this storage account.
    - **tfstate**: terraform state files will be stored in this container.
    - **labs**: the labs that you will save will be stored in this container.

Important points to note

- All your data is stored in a storage account in '_repro-project_' resource group of your subscription. If you delete this storage account, all data will be lost. We don't keep a copy of your data.
- Make sure there is exactly one storage account in '_repro-project_' resource group. If you create additional storage accounts in this resource-group, you will see unexpected behaviors.

## Lab

### What is a lab?

In simplest term a Lab is a scenario that you would want to create. For example, you may want to create an AKS cluster with following specifications.

- Create a VNET
- Create an Azure Firewall
- Add all required Egress rules to Azure Firewall.
- Create a Private AKS Cluster with UDR
- Create a Jump Server in VNET with Public IP to SSH and hop to access your private cluster.

or maybe,

- Create a VNET
- Create a Private AKS Cluster with Standard LB
- Deploy Ingress Nginx controller and a dummy app on this cluster.

You can use this tool to create and deploy labs. Labs can be saved for re-use in future, exported and shared with others and imported to the tool.

To create, deploy, import or export a lab, you can use [Builder](#builder)

This is what a lab object looks like.

```json
{
 "id": "",
 "name": "",
 "description": "",
 "tags": [],
 "template": {
  "resourceGroup": {
   "location": "East US"
  },
  "virtualNetworks": [],
  "subnets": [],
  "jumpservers": [],
  "networkSecurityGroups": [],
  "kubernetesClusters": [
   {
   "kubernetesVersion": "1.24.9",
   "networkPlugin": "kubenet",
   "networkPolicy": "null",
   "networkPluginMode": "null",
   "outboundType": "loadBalancer",
   "privateClusterEnabled": "false",
   "addons": {
    "appGateway": false,
    "microsoftDefender": false
   },
   "defaultNodePool": {
    "enableAutoScaling": false,
    "minCount": 1,
    "maxCount": 1
   }
   }
  ],
  "firewalls": [],
  "containerRegistries": [],
  "appGateways": []
 },
 "extendScript": "removed for simplicity of docs",
 "message": "",
 "type": "template",
 "createdBy": "",
 "createdOn": "",
 "updatedBy": "",
 "updatedOn": ""
}
```

### Saving your lab

You should be able to recreate simple scenarios easily. But for complex scenarios especially when you end up using [Extension Script](#extension-script) then it becomes absolutely necessary to save your work. You can use '_Save_' button in [Builder](#builder) to save your work. You will be presented with a form and following information will be requested.

- **Name:**: I know it's hard to name stuff. But try your best to give one liner introduction of your lab.
- **Description**: Add as much information as humanly possible. It's important that you get the idea of what this lab does when you come back later after a month and shouldn't have to read the extension script. trust me, it's important.
- **Tags**: Plan is to add search feature later which will help you find labs based on tags, something like tags in stack overflow.
- **Template**: This is auto populated.
- **Extension Script**: This is auto populated.

- **Update**: This will update the existing lab.
- **Save as New**: This will save as a new lab. Use this to make a copy of your existing lab.

### Sharing Lab

- **Export** - You can use '_Export_' button in [Builder](#builder) to export lab to a file, which then can be shared with anyone, and they can use this to import and use.
- **Import** - You can use '_Import_' button in [Builder](#builder) to import lab from a file. You can then [Save](#saving-your-lab) it in your templates.
- **[Shared Templates](https://actlabs.azureedge.net/templates)** - There are some pre-built labs that you can use to get a head start.
- **Contributing to shared templates.** - _Coming soon_

## Extension Script

Extension script gives you the ability to go beyond what this tool can do out of the box and be really creative. You can use this to do everything that can be done using Azure CLI. Some examples use cases are:

- Pulling an image from docker hub to your ACR.
- Deploy an application to Kubernetes cluster.
- Adding additional node pools to your cluster.
- Ordering food online for free. Well, not that, but you get the idea.

### How this works?

This script runs in two primary modes.

- Deploy
- Destroy

#### Deploy (Extend) Mode

When click '**Deploy**' button, the base infra is deployed using terraform code. After that completes successfully, extension script is deployed. Both these steps happen automatically in order. Since extension script runs after terraform apply is finished. It has access to terraform output.
When running in deploy (extend) mode, 'extend' function is called.

```bash
function extend() {
 # Add your code here to be executed after apply
 ok "nothing to extend"
}
```

```mermaid
sequenceDiagram
App ->> Server : Deploy Request
Server ->> Azure : Terraform Apply
Azure ->> Server: Success
Server ->> App: Success
App ->> Server: Extension Script (Deploy)
Azure ->> Server: Pull Terraform Output
Server ->> Azure: Exteion Script (Deploy)
Azure ->> Server: Success
Server ->> App: Success
```

#### Destroy Mode

When click '**Destroy**' button, first, extension script runs in destroy mode, and lets you delete the resources that were created in deploy mode. Or do any other activity that must be done gracefully before resources are destroyed.
When running in destroy mode, 'destroy' function is called.

```bash
function destroy() {
 # Add your code here to be executed before destruction
 ok "nothing to destroy"
}
```

```mermaid
sequenceDiagram
App ->> Server : Detroy Request
Azure ->> Server : Pull Terraform Output
Server ->> Azure : Extension Script (Destroy Mode)
Azure ->> Server: Success
Server ->> App: Success
App ->> Server: Terraform Destroy
Server ->> Azure: Terraform Destroy
Azure ->> Server: Success
Server ->> App: Success
```

### Environment Variables

Following environment variables are available for script to use. There may be other variables that are not in this list. Any terraform output is automatically added as an even variable for extension script. For example, terraform output "resource_group" is automatically added as an env variable "RESOURCE_GROUP". You can see entire terraform output in the deployment logs.
| Variable | Description |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RESOURCE_GROUP | Name of the resource group in azure. This is where all resources will be deployed. Please note if you create additional resource groups using extension script you need to manage the deleting in destroy function. |
| ACR_NAME | Name of the ACR if deployed |
| AKS_LOGIN | Command to login to the AKS Cluster if deployed |
| CLUSTER_NAME | Name of AKS Cluster if deployed |
| CLUSTER_VERSION | Version of AKS Cluster if deployed |
| FIREWALL_PRIVATE_IP | Private IP address of the firewall. |
| NSG_NAME | Name of the NSG associated with subnet where AKS cluster is deployed, you can use this to add/remove rules using extension scripts" |
| LOCATION | This is the Azure Region where the resources are deployed. None of the resources are given region exclusively. They all inherit it from resource group. |
| VNET_NAME | Name of the virtual network. |
| CLUSTER_MSI_ID | Clusters managed identity ID. |
| KUBELET_MSI_ID | Kubelet's managed identity |

### Shared Functions

There are few things that almost all scripts will do. We are aware of these and added them as shared functions which are available to the script and are ready for use.

# Add some color
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

err() {
  echo -e "${RED}[$(date +'%Y-%m-%dT%H:%M:%S%z')]: ERROR - $* ${NC}" >&1
}

log() {
  echo -e "[$(date +'%Y-%m-%dT%H:%M:%S%z')]: INFO - $*" >&1
}

ok() {
  echo -e "${GREEN}[$(date +'%Y-%m-%dT%H:%M:%S%z')]: INFO - $* ${NC}" >&1
}

- Loging
    `function log()`
    Args: "string"
    Example: `log "this statement will be logged"`

```bash
log() {
  echo -e "[$(date +'%Y-%m-%dT%H:%M:%S%z')]: INFO - $*" >&1
}
```

- Green (OK) Logging
    `function ok()`
    Args: "string"
    Example: `ok "this statement will be logged as INFO log in green color"`

```bash
ok() {
  echo -e "${GREEN}[$(date +'%Y-%m-%dT%H:%M:%S%z')]: INFO - $* ${NC}" >&1
}
```

- Error Logging
    `function err()`
    Args: "string"
    Example: `err "this error occrured"`

```bash
err() {
  echo -e "${RED}[$(date +'%Y-%m-%dT%H:%M:%S%z')]: ERROR - $* ${NC}" >&1
}
```

In addition to these, we figured that there are few things that we will be doing over and over again in extension scripts. Ultimate goal is to add them as a flag (Switch Button) and make part of terraform, but as an interim solution they are provided as shared functions.

- Deploy ARO Cluster

```bash
function deployAROCluster() {

    # Set the cluster name, and network name variables
    ARO_CLUSTER_NAME="${PREFIX}-aro"

    az group show --name ${RESOURCE_GROUP} --output none > /dev/null 2>&1
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
        
        
        counter=$((${counter}+30))
        sleep 30

        if [[ ${status} == "Creating" ]]; then
            log "cluster state is still 'Creating'. Sleeping for 30 seconds. $((${counter}/60)) minutes passed."
        else
            log "Wait time didn't finish and cluster state isn't 'Creating' anymore. $((${counter}/60)) minutes passed."
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
```

- Delete ARO Cluster

```bash
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
        
        
        counter=$((${counter}+30))
        sleep 30

        if [[ ${status} == "Deleting" ]]; then
            log "cluster state is still 'Deleting'. Sleeping for 30 seconds. $((${counter}/60)) minutes passed."
        else
            log "Wait time didn't finish and cluster state isn't 'Deleting' anymore. $((${counter}/60)) minutes passed."
        fi
    done
}
```

- Deploy Ingress Nginx Controller.

```bash
function deployIngressNginxController() {
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
            ok "External IP : $EXTERNAL_IP"
            break
        fi
        sleep 30s
    done
}
```

- Deploy Dummy App (HTTPBIN)

```bash
function deployHttpbin() {
cat <<EOF | kubectl apply -f -
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
          image: kennethreitz/httpbin
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
  annotations:
    kubernetes.io/ingress.class: azure/application-gateway
  name: httpbin-ingress-agic
  namespace: default
spec:
  rules:
  - host: httpbin-agic.evaverma.com
    http:
      paths:
        - path: /
          pathType: Prefix
          backend:
            service:
              name: httpbin
              port:
                number: 80
EOF
}
```

## Builder

[Builder](https://actlabs.azureedge.net/builder)
