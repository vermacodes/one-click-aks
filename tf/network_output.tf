output vnet_name {
    value = [for vnets in azurerm_virtual_network.this : vnets.name]
}