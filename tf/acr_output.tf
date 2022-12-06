# This output is written to pull output of only one ACR. 
# If you use this tool to deploy more than one, you need to add other outputs.
output "acr_name" {
  value = length(var.container_registries) == 0 ? "" : azurerm_container_registry.this[0].name
}
