resource "azurerm_container_registry" "this" {
  count               = var.container_registries == null ? 0 : length(var.container_registries)
  name                = module.naming.container_registry.name
  resource_group_name = azurerm_resource_group.this.name
  sku                 = "Premium"
  location            = azurerm_resource_group.this.location
}

resource "azurerm_role_assignment" "kubelet_acr_pull" {
  count                = var.container_registries == null ? 0 : length(var.container_registries)
  principal_id         = azurerm_user_assigned_identity.kubelet_identity.principal_id
  scope                = azurerm_container_registry.this[count.index].id
  role_definition_name = "AcrPull"
}
