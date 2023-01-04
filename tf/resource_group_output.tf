output "resource_group" {
  value       = azurerm_resource_group.this.name
  description = "Resource Group Name"
}

output "location" {
  value       = azurerm_resource_group.this.location
  description = "Resource Group Location"
}
