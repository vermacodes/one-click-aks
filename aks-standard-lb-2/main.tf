data "http" "my_ip" {
  url = "http://ipv4.icanhazip.com"
}

resource "random_string" "random" {
  length  = 4
  upper   = false
  numeric = false
  special = false
}

module "naming" {
  source = "Azure/naming/azurerm"
  prefix = ["${random_string.random.result}"]
}

resource "azurerm_resource_group" "this" {
  name     = module.naming.resource_group.name
  location = "East US"
}

module "jump_server_snet_nsg" {
  source              = "Azure/network-security-group/azurerm"
  resource_group_name = azurerm_resource_group.this.name
  security_group_name = "jump-server-snet-nsg"

  depends_on = [azurerm_resource_group.this]
}

module "kubernetes_snet_nsg" {
  source              = "Azure/network-security-group/azurerm"
  resource_group_name = azurerm_resource_group.this.name
  security_group_name = "kubernetes-snet-nsg"

  depends_on = [azurerm_resource_group.this]
}


# This module sucks. Got time? Fix this.
#
# module "kubernetes-routetable" {
#   source              = "Azure/routetable/azurerm"
#   resource_group_name = azurerm_resource_group.this.name
#   route_prefixes      = ["0.0.0.0/0", "10.0.0.0/8"]
#   route_nexthop_types = ["Internet", "VnetLocal"]
#   route_names         = ["internet", "VnetLocal"]
# }

resource "azurerm_route_table" "this" {
  name                          = "kubernetes-route-table"
  location                      = azurerm_resource_group.this.location
  resource_group_name           = azurerm_resource_group.this.name
  disable_bgp_route_propagation = false

  route {
    name           = "Internet"
    address_prefix = "0.0.0.0/0"
    next_hop_type  = "Internet"
  }

  route {
    name           = "VnetLocal"
    address_prefix = "10.0.0.0/8"
    next_hop_type  = "VnetLocal"
  }
}

module "vnet" {
  source              = "Azure/vnet/azurerm"
  vnet_name           = module.naming.virtual_network.name
  resource_group_name = azurerm_resource_group.this.name
  address_space       = ["10.1.0.0/16", "10.2.0.0/16"]
  subnet_prefixes     = ["10.1.0.0/24", "10.1.1.0/24", "10.2.0.0/16"]
  subnet_names        = ["AzureFirewallSubnet", "JumpServerSubnet", "KubernetesSubnet"]

  nsg_ids = {
    JumpServerSubnet = module.jump_server_snet_nsg.network_security_group_id
    KubernetesSubnet = module.kubernetes_snet_nsg.network_security_group_id
  }

  route_tables_ids = {
    KubernetesSubnet = azurerm_route_table.this.id
  }

  depends_on = [
    module.kubernetes_snet_nsg,
    module.jump_server_snet_nsg,
    azurerm_route_table.this
  ]
}

module "aks" {
  source = "github.com/Azure/terraform-azurerm-aks?ref=master"

  prefix                           = random_string.random.result
  resource_group_name              = azurerm_resource_group.this.name
  agents_availability_zones        = ["1", "2"]
  agents_count                     = null
  agents_max_count                 = 2
  agents_max_pods                  = 100
  agents_min_count                 = 1
  agents_pool_name                 = "testnodepool"
  agents_type                      = "VirtualMachineScaleSets"
  azure_policy_enabled             = true
  enable_auto_scaling              = true
  http_application_routing_enabled = true
  log_analytics_workspace_enabled  = true
  net_profile_dns_service_ip       = "10.0.0.10"
  net_profile_docker_bridge_cidr   = "170.10.0.1/16"
  net_profile_service_cidr         = "10.0.0.0/16"
  network_plugin                   = "azure"
  network_policy                   = "azure"
  os_disk_size_gb                  = 60
  private_cluster_enabled          = false
  vnet_subnet_id                   = module.vnet.vnet_subnets[2]

  depends_on = [azurerm_resource_group.this]
}

# aks_name output used from aks moudle is not added to the upstream repo yet. Uncomment this change after the PR is merged.
# PR -> https://github.com/Azure/terraform-azurerm-aks/pull/234
#
# output "aks_login" {
#   value = "az aks get-credentials --name ${module.aks.aks_name} --resource-group ${azurerm_resource_group.this.name}"
# }
