resource "azurerm_kubernetes_cluster" "this" {
  name                    = module.naming.resource_group.name
  location                = azurerm_resource_group.this.location
  resource_group_name     = azurerm_resource_group.this.name
  dns_prefix              = "aks"
  private_cluster_enabled = var.kubernetes_cluster.private_cluster_enabled

  default_node_pool {
    name           = "default"
    node_count     = 1
    vm_size        = "Standard_D2_v2"
    vnet_subnet_id = length(var.virtual_networks) == 0 ? null : azurerm_subnet.this[2].id
  }

  network_profile {
    network_plugin = var.kubernetes_cluster.network_plugin
    network_policy = var.kubernetes_cluster.network_policy == "null" ? null : var.kubernetes_cluster.network_policy
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = "Production"
  }
}
