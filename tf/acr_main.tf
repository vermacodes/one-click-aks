resource "azurerm_container_registry" "this" {
  count               = var.container_registries == null ? 0 : length(var.container_registries)
  name                = module.naming.container_registry.name
  resource_group_name = azurerm_resource_group.this.name
  sku                 = "Premium"
  location            = azurerm_resource_group.this.location
}
