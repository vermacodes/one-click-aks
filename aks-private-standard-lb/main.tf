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
  source      = "Azure/naming/azurerm"
  prefix = [ "${random_string.random.result}" ]
}

resource "azurerm_resource_group" "this" {
  name     = module.naming.resource_group.name
  location = "East US"
}

module "jump-server-snet-nsg" {
  source                = "Azure/network-security-group/azurerm"
  resource_group_name   = azurerm_resource_group.this.name
  security_group_name   = "jump-server-snet-nsg"

  depends_on = [azurerm_resource_group.this]
}

module "kubernetes-snet-nsg" {
  source                = "Azure/network-security-group/azurerm"
  resource_group_name   = azurerm_resource_group.this.name
  security_group_name   = "kubernetes-snet-nsg"

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
    JumpServerSubnet = module.jump-server-snet-nsg.network_security_group_id
    KubernetesSubnet = module.kubernetes-snet-nsg.network_security_group_id
  }

  route_tables_ids = {
    KubernetesSubnet = azurerm_route_table.this.id
  } 

  depends_on = [module.kubernetes-snet-nsg, module.jump-server-snet-nsg, azurerm_route_table.this]
}

