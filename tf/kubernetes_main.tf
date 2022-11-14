resource "azurerm_kubernetes_cluster" "this" {
  name                    = module.naming.kubernetes_cluster.name
  location                = azurerm_resource_group.this.location
  resource_group_name     = azurerm_resource_group.this.name
  dns_prefix              = "aks"
  private_cluster_enabled = var.kubernetes_cluster.private_cluster_enabled

  default_node_pool {
    name                = "default"
    min_count           = var.kubernetes_cluster.default_node_pool.enable_auto_scaling == false ? null : var.kubernetes_cluster.default_node_pool.min_count
    max_count           = var.kubernetes_cluster.default_node_pool.enable_auto_scaling == false ? null : var.kubernetes_cluster.default_node_pool.max_count
    node_count          = var.kubernetes_cluster.default_node_pool.enable_auto_scaling == false ? 1 : null
    vm_size             = "Standard_D2_v2"
    enable_auto_scaling = var.kubernetes_cluster.default_node_pool.enable_auto_scaling
    vnet_subnet_id      = var.virtual_networks == null ? null : length(var.virtual_networks) == 0 ? null : azurerm_subnet.this[2].id
  }

  network_profile {
    network_plugin = var.kubernetes_cluster.network_plugin
    network_policy = var.kubernetes_cluster.network_policy == "null" ? null : var.kubernetes_cluster.network_policy
  }

  identity {
    type = "SystemAssigned"
  }
}
