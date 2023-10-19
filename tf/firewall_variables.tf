# variable "firewall_public_ip" {
#   type = list(object({
#     name              = string
#     allocation_method = string
#     sku               = string
#   }))
#   default = [{
#     allocation_method = "Static"
#     name              = "firewall"
#     sku               = "Standard"
#   }]
# }

variable "firewalls" {
  type = list(object({
    sku_name = string
    sku_tier = string
  }))
  default = [{
    sku_name = "AZFW_VNet"
    sku_tier = "Standard"
  }]
}

variable "firewall_network_rules" {
  description = "Firewall Network Rules"
  type = list(object({
    name     = string
    priority = number
    action   = string
    rules = list(object({
      name                  = string
      description           = string
      source_addresses      = list(string)
      destination_ports     = list(string)
      destination_addresses = list(string)
      protocols             = list(string)
    }))
  }))
  default = [
    {
      name     = "firewall-network-rule-aks"
      action   = "Allow"
      priority = "100"
      rules = [{
        name                  = "Azure Workload AKS Subnets - Ubuntu"
        description           = "Azure Workload AKS Subnets - Ubuntu"
        source_addresses      = ["10.1.0.0/24", "10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
        destination_ports     = ["123"]
        destination_addresses = ["91.189.89.199", "91.189.89.198", "91.189.94.4", "91.189.91.157"]
        protocols             = ["UDP"]
      }]
    }
  ]
}

# variable "firewall_nat_rules" {
#   description = "Firewall NAT Rules"
#   type = map(object({
#     name     = string
#     priority = number
#     rules = list(object({
#       name               = string
#       description        = string
#       source_addresses   = list(string)
#       destination_ports  = list(string)
#       protocols          = list(string)
#       translated_address = string
#       translated_port    = number
#     }))
#   }))
#   default = {}
# }

variable "firewall_application_rules" {
  description = "Firewall Applicaiton Rules."
  type = list(object({
    name     = string
    priority = number
    action   = string
    rules = list(object({
      name             = string
      source_addresses = list(string)
      target_fqdns     = list(string)
      protocol = list(object({
        port = string
        type = string
      }))
    }))
  }))
  default = [
    {
      name     = "app-rule-aks"
      priority = "200"
      action   = "Allow"
      rules = [
        {
          name             = "Azure Global required FQDN / application rules"
          description      = "Azure Global required FQDN / application rules"
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
          fqdn_tags        = null #["Azurebackup"]
          target_fqdns     = ["*.cdn.mscr.io", "*.azmk8s.io", "management.azure.com", "login.microsoftonline.com", "acs-mirror.azureedge.net", "packages.microsoft.com", "*.data.mcr.microsoft.com", "mcr.microsoft.com"]
          protocol = [{
            port = 443
            type = "Https"

          }]
        },
        {
          name             = "Azure US Government required FQDN / application rules"
          description      = "Azure US Government required FQDN / application rules"
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
          fqdn_tags        = null
          target_fqdns     = ["*.cdn.mscr.io", "management.usgovcloudapi.net", "login.microsoftonline.com", "acs-mirror.azureedge.net", "*.aks.containerservice.azure.us", "packages.microsoft.com", "*.data.mcr.microsoft.com", "mcr.microsoft.com"]
          protocol = [{
            port = 443
            type = "Https"

          }]
        },
        {
          name             = "Optional recommended FQDN / application rules for AKS clusters"
          description      = "Optional recommended FQDN / application rules for AKS clusters"
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
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
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
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
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
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
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
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
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
          fqdn_tags        = null
          target_fqdns     = ["*.amazonaws.com", "*.pkg.dev", "*.k8s.io", "*.docker.io", "*.gcr.io", "*.docker.com", "gcr.io", "*.googleapis.com"]
          protocol = [{
            port = 443
            type = "Https"

          }]
        },
        {
          name             = "Azure Workload AKS Subnet - Azurepolicy"
          description      = "Azure Workload AKS Subnet - Azurepolicy"
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
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
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
          fqdn_tags        = null
          target_fqdns     = ["AzureKubernetesService"]
          protocol = [{
            port = 443
            type = "Https"

          }]
        }
      ]
    },
    {
      name     = "firewall-app-rule-linkerd"
      priority = "300"
      action   = "Allow"
      rules = [
        {
          name             = "LinkerD"
          description      = "LinderD to pull images"
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
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
    },
    {
      name     = "firewall-app-rule-nodered"
      priority = "400"
      action   = "Allow"
      rules = [
        {
          name             = "NodeRed"
          description      = "NodeRed to pull images"
          source_addresses = ["10.1.0.0/24", "10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
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
  ]
}
