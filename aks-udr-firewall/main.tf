terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>2.67.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~>3.1.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~>2.2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~>2.1.2"
    }
  }
  required_version = "~> 1.0"
}

provider "azurerm" {
  features {}
}

provider "kubernetes" {
  host                   = module.kubernetes.kube_config.host
  client_certificate     = base64decode(module.kubernetes.kube_config.client_certificate)
  client_key             = base64decode(module.kubernetes.kube_config.client_key)
  cluster_ca_certificate = base64decode(module.kubernetes.kube_config.cluster_ca_certificate)
}

provider "helm" {
  kubernetes {
    host                   = module.kubernetes.kube_config.host
    client_certificate     = base64decode(module.kubernetes.kube_config.client_certificate)
    client_key             = base64decode(module.kubernetes.kube_config.client_key)
    cluster_ca_certificate = base64decode(module.kubernetes.kube_config.cluster_ca_certificate)
  }
}

data "http" "my_ip" {
  url = "http://ipv4.icanhazip.com"
}

data "azurerm_subscription" "current" {
}

resource "random_string" "random" {
  length  = 4
  upper   = false
  number  = false
  special = false
}

resource "random_password" "admin" {
  length  = 14
  special = true
}

module "subscription" {
  source          = "github.com/Azure-Terraform/terraform-azurerm-subscription-data.git?ref=v1.0.0"
  subscription_id = data.azurerm_subscription.current.subscription_id
}

module "naming" {
  source = "github.com/vermacodes/example-naming-template.git?ref=v1.0.0"
}

module "metadata" {
  source = "github.com/Azure-Terraform/terraform-azurerm-metadata.git?ref=v1.5.0"

  naming_rules = module.naming.yaml

  market              = "us"
  project             = "https://github.com/Azure-Terraform/terraform-azurerm-kubernetes/tree/master/example/mixed-arch"
  location            = "eastus"
  environment         = "sandbox"
  product_name        = random_string.random.result
  business_unit       = "infra"
  product_group       = "contoso"
  subscription_id     = module.subscription.output.subscription_id
  subscription_type   = "dev"
  resource_group_type = "app"
}

module "resource_group" {
  source = "github.com/Azure-Terraform/terraform-azurerm-resource-group.git?ref=v1.0.0"

  location = module.metadata.location
  names    = module.metadata.names
  tags     = module.metadata.tags
}

module "virtual_network" {
  source = "github.com/Azure-Terraform/terraform-azurerm-virtual-network.git?ref=v5.0.0"

  naming_rules = module.naming.yaml

  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  names               = module.metadata.names
  tags                = module.metadata.tags

  address_space = ["10.1.0.0/22"]

  subnets = {
    iaas-private = {
      cidrs                   = ["10.1.0.0/24"]
      route_table_association = "aks"
      configure_nsg_rules     = false
    }
    iaas-public = {
      cidrs                   = ["10.1.1.0/24"]
      route_table_association = "aks"
      configure_nsg_rules     = false
    }
    AzureFirewallSubnet = {
      cidrs                         = ["10.1.2.0/24"]
      create_network_security_group = false
      configure_nsg_rules           = false
    }
  }

  route_tables = {
    aks = {
      disable_bgp_route_propagation = true
      use_inline_routes             = false
      routes = {
        internet = {
          address_prefix = "0.0.0.0/0"
          next_hop_type  = "VirtualAppliance"
          next_hop_in_ip_address = "10.1.2.4"
        }
        local-vnet = {
          address_prefix = "10.1.0.0/22"
          next_hop_type  = "vnetlocal"
        }
      }
    }
  }
}

module "firewall" {
  source              = "github.com/vermacodes/terraform-azurerm-firewall.git?ref=main"
  #source              = "../../azure-terraform/terraform-azurerm-firewall/"
  location            = module.metadata.location
  names               = module.metadata.names
  tags                = module.metadata.tags
  resource_group_name = module.resource_group.name
  firewall_subnet_id  = module.virtual_network.subnets["AzureFirewallSubnet"].id

  firewall_network_rules = {
    "network_rule1" = {
      name         = "firewall-network-rule-aks"
      action       = "Allow"
      priority     = "100"
      rules = [{
        name                  = "Azure Workload AKS Subnets - Ubuntu"
        description           = "Azure Workload AKS Subnets - Ubuntu"
        source_addresses      = ["10.1.0.0/24", "10.1.1.0/24"]
        destination_ports     = ["123"]
        destination_addresses = ["91.189.89.199", "91.189.89.198", "91.189.94.4", "91.189.91.157"]
        protocols             = ["UDP"]
        }]
    }
  }

  firewall_application_rules = {
    "app_rule1" = {
      name         = "app-rule-aks"
      priority     = "200"
      action       = "Allow"
      rules = [
        {
          name             = "Azure Global required FQDN / application rules"
          description      = "Azure Global required FQDN / application rules"
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24"]
          fqdn_tags        = null #["Azurebackup"]
          target_fqdns     = ["*.cdn.mscr.io", "*.hcp.eastus.azmk8s.io", "management.azure.com", "login.microsoftonline.com", "acs-mirror.azureedge.net", "packages.microsoft.com", "*.data.mcr.microsoft.com", "mcr.microsoft.com"]
          protocol = [{
            port = 443
            type = "Https"

          }]
        },
        {
          name             = "Azure US Government required FQDN / application rules"
          description      = "Azure US Government required FQDN / application rules"
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24"]
          fqdn_tags        = null
          target_fqdns     = ["*.cdn.mscr.io", "management.usgovcloudapi.net", "login.microsoftonline.com", "acs-mirror.azureedge.net", "*.hcp.eastus.cx.aks.containerservice.azure.us", "packages.microsoft.com", "*.data.mcr.microsoft.com", "mcr.microsoft.com"]
          protocol = [{
            port = 443
            type = "Https"

          }]
        },
        {
          name             = "Optional recommended FQDN / application rules for AKS clusters"
          description      = "Optional recommended FQDN / application rules for AKS clusters"
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24"]
          fqdn_tags        = null
          target_fqdns     = ["security.ubuntu.com", "azure.archive.ubuntu.com", "changelogs.ubuntu.com"]
          protocol = [{
            port = 80
            type = "Http"

          }]
        },
        {
          name             = "GPU enabled AKS clusters"
          description      = "GPU enabled AKS clusters"
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24"]
          fqdn_tags        = null
          target_fqdns     = ["nvidia.github.io", "us.download.nvidia.com", "apt.dockerproject.org"]
          protocol = [{
            port = 443
            type = "Https"

          }]
        },
        {
          name             = "Azure Workload AKS Subnet - Azure Monitoring For Containier"
          description      = "Azure Workload AKS Subnet - Azure Monitoring For Containier"
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24"]
          fqdn_tags        = null
          target_fqdns     = ["*.ods.opinsights.azure.com", "dc.services.visualstudio.com", "*.oms.opinsights.azure.com", "*.monitoring.azure.com", "*.applicationinsights.azure.com", "*.cloudapp.net", "*.monitor.azure.com", "*.trafficmanager.net", "rt.services.visualstudio.com", "*.blob.core.windows.net", "*.azure-automation.net", "*.loganalytics.io", "*.applicationinsights.io", "169.254.169.254"]
          protocol = [{
            port = 443
            type = "Https"

          }]
        },
        {
          name             = "Azure Workload AKS Subnet - Azure Dev Spaces"
          description      = "Azure Workload AKS Subnet - Azure Dev Spaces"
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24"]
          fqdn_tags        = null
          target_fqdns     = ["gcr.io", "storage.googleapis.com", "cloudflare.docker.com"]
          protocol = [{
            port = 443
            type = "Https"

          }]
        },
        {
          name             = "Azure Workload AKS Subnet - Docker Repository"
          description      = "Azure Workload AKS Subnet - Docker Repository"
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24"]
          fqdn_tags        = null
          target_fqdns     = ["*.docker.io", "*.gcr.io", "*.docker.com", "gcr.io", "*.googleapis.com"]
          protocol = [{
            port = 443
            type = "Https"

          }]
        },
        {
          name             = "Azure Workload AKS Subnet - Azurepolicy"
          description      = "Azure Workload AKS Subnet - Azurepolicy"
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24"]
          fqdn_tags        = null
          target_fqdns     = ["dc.services.visualstudio.com", "raw.githubusercontent.com", "gov-prod-policy-data.trafficmanager.net"]
          protocol = [{
            port = 443
            type = "Https"

          }]
        },
        {
          name             = "AzureKubernetesService"
          description      = "AzureKubernetesService"
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24"]
          fqdn_tags        = null
          target_fqdns     = ["AzureKubernetesService"]
          protocol = [{
            port = 443
            type = "Https"

          }]
        }
      ]
    },
    "app_rule3" = {
      name         = "firewall-app-rule-linkerd"
      priority     = "300"
      action       = "Allow"
      rules = [
        {
          name             = "LinkerD"
          description      = "LinderD to pull images"
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24"]
          fqdn_tags        = null
          target_fqdns     = ["cr.l5d.io", "ghcr.io", "*.githubusercontent.com", "*.linkerd.io", "*.amazonaws.com"]
          protocol = [{
            port = 443
            type = "Https"
            },
            {
              port = 80
              type = "Http"
            }
          ]
        }
      ]
    }
    "app_rule4" = {
      name         = "firewall-app-rule-nodered"
      priority     = "400"
      action       = "Allow"
      rules = [
        {
          name             = "NodeRed"
          description      = "NodeRed to pull images"
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24"]
          fqdn_tags        = null
          target_fqdns     = ["registry.npmjs.org"]
          protocol = [{
            port = 443
            type = "Https"
            },
            {
              port = 80
              type = "Http"
            }
          ]
        }
      ]
    }
  }
}

module "kubernetes" {
  depends_on = [module.firewall]

  source = "github.com/Azure-Terraform/terraform-azurerm-kubernetes.git?ref=v4.2.2"

  location            = module.metadata.location
  names               = module.metadata.names
  tags                = module.metadata.tags
  resource_group_name = module.resource_group.name

  identity_type = "UserAssigned"

  windows_profile = {
    admin_username = "testadmin"
    admin_password = random_password.admin.result
  }

  network_plugin = "azure"

  configure_network_role = true

  outbound_type = "userDefinedRouting"

  # Enable/Disable line below to enable/disable authorized ip ranges.
  api_server_authorized_ip_ranges = {
    "my_ip" = "${chomp(data.http.my_ip.response_body)}/32"
    "firewall_public_ip" = "${chomp(module.firewall.firewall_public_ip)}/32"
  }

  virtual_network = {
    subnets = {
      private = {
        id = module.virtual_network.subnets["iaas-private"].id
      }
      public = {
        id = module.virtual_network.subnets["iaas-public"].id
      }
    }
    route_table_id = module.virtual_network.route_tables["aks"].id
  }

  node_pools = {
    system = {
      vm_size                      = "Standard_B2s"
      node_count                   = 2
      only_critical_addons_enabled = true
      subnet                       = "private"
    }
    linuxweb = {
      vm_size             = "Standard_B2ms"
      enable_auto_scaling = true
      min_count           = 1
      max_count           = 3
      subnet              = "public"
    }
    # winweb = {
    #   vm_size             = "Standard_D4a_v4"
    #   os_type             = "Windows"
    #   enable_auto_scaling = true
    #   min_count           = 1
    #   max_count           = 3
    #   subnet              = "public"
    # }
  }

  default_node_pool = "system"

}

resource "azurerm_network_security_rule" "ingress_public_allow_nginx" {
  name                        = "AllowNginx"
  priority                    = 100
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "tcp"
  source_port_range           = "*"
  destination_port_range      = "80"
  source_address_prefix       = "Internet"
  destination_address_prefix  = data.kubernetes_service.nginx.status.0.load_balancer.0.ingress.0.ip
  resource_group_name         = module.virtual_network.subnets["iaas-public"].resource_group_name
  network_security_group_name = module.virtual_network.subnets["iaas-public"].network_security_group_name
}


resource "helm_release" "nginx" {
  depends_on = [module.kubernetes]
  name       = "nginx"
  chart      = "./helm_chart"

  set {
    name  = "name"
    value = "nginx"
  }

  set {
    name  = "image"
    value = "nginx:latest"
  }

  set {
    name  = "nodeSelector"
    value = yamlencode({ agentpool = "linuxweb" })
  }
}

data "kubernetes_service" "nginx" {
  depends_on = [helm_release.nginx]
  metadata {
    name = "nginx"
  }
}


output "nginx_url" {
  value = "http://${data.kubernetes_service.nginx.status.0.load_balancer.0.ingress.0.ip}"
}

output "aks_login" {
  value = "az aks get-credentials --name ${module.kubernetes.name} --resource-group ${module.resource_group.name}"
}
