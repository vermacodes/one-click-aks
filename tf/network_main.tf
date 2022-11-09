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
  count               = var.nsg == null ? 0 : length(var.nsg)
  name                = module.naming.network_security_group.name
  location            = azurerm_resource_group.this.location
  resource_group_name = azurerm_resource_group.this.name

  security_rule {
    name                       = "AllowAnyHTTPSInbound"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "example" {
  count                     = var.nsg == null ? 0 : var.subnets == null ? 0 : length(var.nsg)
  subnet_id                 = azurerm_subnet.this[2].id
  network_security_group_id = azurerm_network_security_group.this[0].id
}
