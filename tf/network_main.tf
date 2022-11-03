resource "azurerm_virtual_network" "this" {
  count               = length(var.virtual_networks)
  name                = module.naming.virtual_network.name
  location            = azurerm_resource_group.this.location
  resource_group_name = azurerm_resource_group.this.name
  address_space       = var.virtual_networks[count.index].address_space
}

resource "azurerm_subnet" "this" {
  count                = length(var.subnets)
  name                 = var.subnets[count.index].name
  resource_group_name  = azurerm_resource_group.this.name
  address_prefixes     = var.subnets[count.index].address_prefixes
  virtual_network_name = azurerm_virtual_network.this[0].name
}
