output "vnet_name" {
  value = length(var.virtual_networks) == 0 ? "" : azurerm_virtual_network.this[0].name
}

output "nsg_name" {
  value = length(var.network_security_groups) == 0 ? "" : azurerm_network_security_group.this[0].name
}
