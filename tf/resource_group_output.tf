output "resource_group_name" {
  value = azurerm_resource_group.this.name
  description = "Resource Group Name"
}

output "resource_group_location" {
  value = azurerm_resource_group.this.location
  description = "Resource Group Location"
}