output "resource_group" {
  value       = azurerm_resource_group.this.name
  description = "Resource Group Name"
}

output "location" {
  value       = azurerm_resource_group.this.location
  description = "Resource Group Location"
}

output "prefix" {
  value       = "${terraform.workspace}-${random_string.random.result}"
  description = "Prefix for the resources to be used in extension script."
}
