resource "azurerm_log_analytics_workspace" "this" {
  count               = var.kubernetes_clusters == null || length(var.kubernetes_clusters) == 0 ? 0 : var.kubernetes_clusters[0].addons.microsoft_defender ? 1 : 0
  name                = module.naming.log_analytics_workspace.name
  location            = azurerm_resource_group.this.location
  resource_group_name = azurerm_resource_group.this.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}
