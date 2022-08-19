terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>2.70.0"
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

# Following section gives a real word but it forces name change everytime.
# super low priority but if time permits this is worth chasing.
# sticking to random_string for now.
#
# data "http" "random" {
#   url = "https://random-word-api.herokuapp.com/word?length=4"
# }

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
          next_hop_type  = "Internet"
        }
        local-vnet = {
          address_prefix = "10.1.0.0/22"
          next_hop_type  = "vnetlocal"
        }
      }
    }
  }
}

module "kubernetes" {
  //source = "github.com/Azure-Terraform/terraform-azurerm-kubernetes.git?ref=v4.2.2"
  source = "../../azure-terraform/terraform-azurerm-kubernetes/"

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

  private_cluster_enabled = true

  # Enable api server authorized ranges by enabling line below.
  # api_server_authorized_ip_ranges = {"my_ip" = "${chomp(data.http.my_ip.response_body)}/32"}

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

module "linux_virtual_machine" {
  source = "github.com/Azure-Terraform/terraform-azurerm-virtual-machine?ref=v3.0.1"

  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  names               = module.metadata.names
  tags                = module.metadata.tags

  # Windows or Linux?
  kernel_type = "linux"

  # Instance Size
  virtual_machine_size = "Standard_B2s"

  # Operating System Image
  source_image_publisher = "Canonical"
  source_image_offer     = "UbuntuServer"
  source_image_sku       = "18.04-LTS"
  source_image_version   = "latest"

  # Virtual Network
  subnet_id         = module.virtual_network.subnets["iaas-public"].id
  public_ip_enabled = true

  # optional
  enable_boot_diagnostics = true
  ultra_ssd_enabled       = false
  availability_zone       = 1
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
  # repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "./helm_chart"

  set {
    name  = "name"
    value = "nginx"
  }

  set {
    name  = "image"
    value = "ingress-nginx/ingress-nginx"
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

output "id" {
  value = module.linux_virtual_machine.virtual_machine_id
}

output "name" {
  value = module.linux_virtual_machine.virtual_machine_name
}

output "vm_admin_login" {
  value = module.linux_virtual_machine.admin_username
}