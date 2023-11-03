# locals {
#   count               = var.kubernetes_clusters == null ? 0 : length(var.kubernetes_clusters)
#   network_plugin_mode = var.kubernetes_clusters[count.index].network_plugin_mode == "null" || var.kubernetes_clusters[count.index].network_plugin_mode == "" ? null : var.kubernetes_clusters[count.index].network_plugin_mode
# }

resource "azurerm_user_assigned_identity" "kubelet_identity" {
  count               = var.kubernetes_clusters == null ? 0 : length(var.kubernetes_clusters)
  name                = "${module.naming.user_assigned_identity.name}-kubelet"
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
}

resource "azurerm_user_assigned_identity" "ccp_identity" {
  count               = var.kubernetes_clusters == null ? 0 : length(var.kubernetes_clusters)
  name                = "${module.naming.user_assigned_identity.name}-ccp"
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
}

resource "azurerm_role_assignment" "identity_operator" {
  count                = var.kubernetes_clusters == null ? 0 : length(var.kubernetes_clusters)
  principal_id         = azurerm_user_assigned_identity.ccp_identity[count.index].principal_id
  scope                = azurerm_resource_group.this.id
  role_definition_name = "Managed Identity Operator"
}

resource "azurerm_role_assignment" "network_contributor" {
  count                = var.kubernetes_clusters == null ? 0 : length(var.kubernetes_clusters)
  principal_id         = azurerm_user_assigned_identity.ccp_identity[count.index].principal_id
  scope                = azurerm_resource_group.this.id
  role_definition_name = "Network Contributor"
}

resource "azurerm_kubernetes_cluster" "this" {
  count                   = var.kubernetes_clusters == null ? 0 : length(var.kubernetes_clusters)
  name                    = module.naming.kubernetes_cluster.name
  location                = azurerm_resource_group.this.location
  resource_group_name     = azurerm_resource_group.this.name
  dns_prefix              = "aks"
  private_cluster_enabled = var.kubernetes_clusters[count.index].private_cluster_enabled
  kubernetes_version      = var.kubernetes_clusters[count.index].kubernetes_version == null || var.kubernetes_clusters[count.index].kubernetes_version == "" ? null : var.kubernetes_clusters[count.index].kubernetes_version

  default_node_pool {
    name                 = "default"
    min_count            = var.kubernetes_clusters[count.index].default_node_pool.enable_auto_scaling == false ? null : var.kubernetes_clusters[count.index].default_node_pool.min_count
    max_count            = var.kubernetes_clusters[count.index].default_node_pool.enable_auto_scaling == false ? null : var.kubernetes_clusters[count.index].default_node_pool.max_count
    node_count           = var.kubernetes_clusters[count.index].default_node_pool.enable_auto_scaling == false ? 1 : null
    vm_size              = "Standard_D2_v5"
    enable_auto_scaling  = var.kubernetes_clusters[count.index].default_node_pool.enable_auto_scaling
    vnet_subnet_id       = var.virtual_networks == null || length(var.virtual_networks) == 0 ? null : azurerm_subnet.this[2].id
    orchestrator_version = var.kubernetes_clusters[count.index].kubernetes_version == null || var.kubernetes_clusters[count.index].kubernetes_version == "" ? null : var.kubernetes_clusters[count.index].kubernetes_version
  }

  network_profile {
    network_plugin      = var.kubernetes_clusters[count.index].network_plugin
    network_policy      = var.kubernetes_clusters[count.index].network_policy == "null" ? null : var.kubernetes_clusters[count.index].network_policy
    outbound_type       = var.kubernetes_clusters[count.index].outbound_type == null || var.kubernetes_clusters[count.index].outbound_type == "" ? "loadBalancer" : var.kubernetes_clusters[count.index].outbound_type
    network_plugin_mode = var.kubernetes_clusters[count.index].network_plugin_mode == "null" || var.kubernetes_clusters[count.index].network_plugin_mode == "" ? null : var.kubernetes_clusters[count.index].network_plugin_mode
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.ccp_identity[0].id]
  }

  kubelet_identity {
    client_id                 = azurerm_user_assigned_identity.kubelet_identity[0].client_id
    object_id                 = azurerm_user_assigned_identity.kubelet_identity[0].principal_id # Principal ID and Object ID are same.
    user_assigned_identity_id = azurerm_user_assigned_identity.kubelet_identity[0].id
  }

  dynamic "ingress_application_gateway" {
    for_each = var.virtual_networks != null && var.kubernetes_clusters[count.index].addons.app_gateway ? [{}] : []
    content {
      subnet_id = azurerm_subnet.this[3].id
    }
  }

  dynamic "microsoft_defender" {
    for_each = var.kubernetes_clusters[count.index].addons.microsoft_defender ? [{}] : []
    content {
      log_analytics_workspace_id = azurerm_log_analytics_workspace.this[0].id
    }
  }

  dynamic "aci_connector_linux" {
    for_each = var.kubernetes_clusters[count.index].addons.virtual_node ? [{}] : []
    content {
      subnet_name = "KubernetesVirtualNodeSubnet"
    }
  }

  dynamic "web_app_routing" {
    for_each = var.kubernetes_clusters[count.index].addons.http_application_routing ? [{}] : []
    content {
      dns_zone_id = ""
    }
  }

  dynamic "service_mesh_profile" {
    for_each = var.kubernetes_clusters[count.index].addons.service_mesh.enabled ? [{}] : []
    content {
      mode                             = var.kubernetes_clusters[count.index].addons.service_mesh.mode
      internal_ingress_gateway_enabled = var.kubernetes_clusters[count.index].addons.service_mesh.internal_ingress_gateway_enabled
      external_ingress_gateway_enabled = var.kubernetes_clusters[count.index].addons.service_mesh.external_ingress_gateway_enabled
    }
  }

  # ingress_application_gateway {
  #   subnet_id = azurerm_subnet.this[3].id
  # }

  depends_on = [
    azurerm_subnet_route_table_association.this,
    azurerm_firewall_application_rule_collection.app_rules_collection,
    azurerm_firewall_network_rule_collection.network_rules_collection,
    azurerm_role_assignment.identity_operator
  ]
}

# Role assigments for app gateway add on.
resource "azurerm_role_assignment" "ingress_app_gateway_rg_reader" {
  count                = var.kubernetes_clusters == null ? 0 : length(var.kubernetes_clusters) == 0 ? 0 : var.kubernetes_clusters[0].addons.app_gateway ? 1 : 0
  principal_id         = azurerm_kubernetes_cluster.this[count.index].ingress_application_gateway[count.index].ingress_application_gateway_identity[count.index].object_id
  scope                = azurerm_resource_group.this.id
  role_definition_name = "Reader"
}

resource "azurerm_role_assignment" "ingress_app_gateway_network_contributor" {
  count                = var.kubernetes_clusters == null ? 0 : length(var.kubernetes_clusters) == 0 ? 0 : var.kubernetes_clusters[0].addons.app_gateway ? 1 : 0
  principal_id         = azurerm_kubernetes_cluster.this[count.index].ingress_application_gateway[count.index].ingress_application_gateway_identity[count.index].object_id
  scope                = azurerm_resource_group.this.id
  role_definition_name = "Network Contributor"
}
