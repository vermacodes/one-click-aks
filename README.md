# One Click AKS : Simplest way to deploy Complex AKS Cluster.

Deploying Azure Kubernetes Cluster is really easy. You can create production grade cluster with couple CLI commands. So what this project brings to the table you ask.
There are hundereds of ways that an AKS cluster can be deployed in and then thousands more to configure and meet your unique requirements. If you have to deploy AKS with differnet configurations over and over again its no more an easy task. Along comes this project.
This project runs locally on your computer and deploys AKS cluster in many different ways. (not all)

# Getting Started.

To get started, headcover to [ACT Labs Start](https://actlabs.azureedge.net/start) page and follow the simple setup wizard.

This setup wizard will help you with following.

-   Running server on your computer.
-   Select your Azure Subscription.
-   Authenticate Azure CLI
-   Create Storage Account
    -   Storage Account will get a random generated name.
    -   You can see this storage account name in settings.
    -   This storage account will be created in a resource group named 'repro-project' in your selected subscription.
    -   You will see that two containers are created in this storage account.
        -   **tfstate**: terraform state files will be stored in this container.
        -   **labs**: the labs that you will save will be stored in this container.

**Important points to note**

-   All your data is stored in a storage account in '_repro-project_' resource group of your subscription. If you delete this storage account, all data will be lost. We don't keep a copy of your data.
-   Make sure there is exactly one storage account in '_repro-project_' resource group. If you create additional storage accounts in this resource-group, you will see unexpected behaviors.

# What is a lab?

In simplest term a Lab is a scenario that you would want to create. For example, you may want to create an AKS cluster with following specifications.

-   Create a VNET
-   Create an Azure Firewall
-   Add all required Egress rules to Azure Firewall.
-   Create a Private AKS Cluster with UDR
-   Create a Jump Server in VNET with Public IP to SSH and hop to access your private cluster.

or maybe,

-   Create a VNET
-   Create a Private AKS Cluster with Standard LB
-   Deploy Ingress Nginx controller and a dummy app on this cluster.

You can use this tool to create and deploy labs. Labs can be saved for re-use in future, exported and shared with others and imported to the tool.

To create, deploy, import or export a lab, you can use [Builder](https://actlabs.azureedge.net/builder)

This is what a lab object looks like.

```
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

# Extension Script.

Extension script gives you the ability to go beyond what this tool can do out of the box and be really creative. You can use this to do everything that can be done using Azure CLI. Some examples use cases are:

-   Pulling an image from docker hub to your ACR.
-   Deploy an application to Kubernetes cluster.
-   Adding additional node pools to your cluster.
-   Ordering food online for free. Well, not that, but you get the idea.

## How this works?

This script runs in two primary modes.

-   Deploy
-   Destroy

### Deploy (Extend) Mode

When click '**Deploy**' button, the base infra is deployed using terraform code. After that completes successfully, extension script is deployed. Both these steps happen automatically in order. Since extension script runs after terraform apply is finished. It has access to terraform output.
When running in deploy (extend) mode, 'extend' function is called.

```
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

### Destroy Mode

When click '**Destroy**' button, first, extension script runs in destroy mode, and lets you delete the resources that were created in deploy mode. Or do any other activity that must be done gracefully before resources are destroyed.
When running in destroy mode, 'destroy' function is called.

```
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

## Environment Variables.

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

## Shared Functions

There are few things that almost all scripts will do. We are aware of these and added them as shared functions which are available to the script and are ready for use.

-   Loging
    `function log()`
    Args: "string"
    Example: `log "this statement will be logged"`

-   Green (OK) Logging
    `function ok()`
    Args: "string"
    Example: `ok "this statement will be logged as INFO log in green color"`

-   Error Logging
    `function err()`
    Args: "string"
    Example: `err "this error occrured"`

In addition to these, we figured that there are few things that we will be doing over and over again in extension scripts. Ultimate goal is to add them as a flag (Switch Button) and make part of terraform, but as an interim solution they are provided as shared functions.

-   Deploy ARO Cluster
    `function deployAROCluster()`

-   Delete ARO Cluster
    `function deleteAROCluster()`

-   Deploy Ingress Nginx Controller.
    `deployIngressNginxController()`

-   Deploy Dummy App (HTTPBIN)
    `function deployHttpbin()`
