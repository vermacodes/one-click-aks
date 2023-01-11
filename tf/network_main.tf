resource "azurerm_virtual_network" "this" {
  count               = var.virtual_networks == null ? 0 : length(var.virtual_networks)
  name                = module.naming.virtual_network.name
  location            = azurerm_resource_group.this.location
  resource_group_name = azurerm_resource_group.this.name
  address_space       = var.virtual_networks[count.index].address_space
}

resource "azurerm_subnet" "this" {
  count                = var.subnets == null ? 0 : length(var.subnets)
  name                 = var.subnets[count.index].name
  resource_group_name  = azurerm_resource_group.this.name
  address_prefixes     = var.subnets[count.index].address_prefixes
  virtual_network_name = azurerm_virtual_network.this[0].name
}

resource "azurerm_network_security_group" "this" {
  count               = var.network_security_groups == null || length(var.network_security_groups) == 0 ? 0 : length(var.network_security_groups)
  name                = module.naming.network_security_group.name
  location            = azurerm_resource_group.this.location
  resource_group_name = azurerm_resource_group.this.name

  # security_rule {
  #   name                       = "AllowAnyHTTPSInbound"
  #   priority                   = 100
  #   direction                  = "Inbound"
  #   access                     = "Deny"
  #   protocol                   = "Tcp"
  #   source_port_range          = "*"
  #   destination_port_range     = "443"
  #   source_address_prefix      = "*"
  #   destination_address_prefix = "*"
  # }
}

resource "azurerm_subnet_network_security_group_association" "this" {
  count                     = var.network_security_groups == null || var.subnets == null || length(var.subnets) == 0 ? 0 : length(var.network_security_groups)
  subnet_id                 = azurerm_subnet.this[2].id
  network_security_group_id = azurerm_network_security_group.this[0].id
}

resource "azurerm_route_table" "this" {
  count               = length(var.firewalls) > 0 && length(var.virtual_networks) > 0 ? 1 : 0
  name                = module.naming.route_table.name
  location            = azurerm_resource_group.this.location
  resource_group_name = azurerm_resource_group.this.name
}

resource "azurerm_route" "default" {
  count                  = length(var.firewalls) > 0 && length(var.virtual_networks) > 0 ? 1 : 0
  name                   = "Default"
  resource_group_name    = azurerm_resource_group.this.name
  route_table_name       = azurerm_route_table.this[0].name
  next_hop_type          = "VirtualAppliance"
  address_prefix         = "0.0.0.0/0"
  next_hop_in_ip_address = "10.1.1.4" # This will always be the IP. Trust me.
}

# Associate kubernetes subnet only if outbound type is UDR
resource "azurerm_subnet_route_table_association" "this" {
  count          = length(var.kubernetes_clusters) == 0 ? 0 : var.kubernetes_clusters[0].outbound_type == "userDefinedRouting" ? 1 : 0
  subnet_id      = azurerm_subnet.this[2].id
  route_table_id = azurerm_route_table.this[0].id
}
