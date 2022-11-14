output vnet_name {
    value = [for vnets in azurerm_virtual_network.this : vnets.name]
}

output nsg_name {
    value = [for nsgs in azurerm_network_security_group.this : nsgs.name]
}