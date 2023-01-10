variable "kubernetes_clusters" {
  description = "AKS Cluster Object"
  type = list(object({
    kubernetes_version      = string
    network_plugin          = string
    network_policy          = string
    network_plugin_mode     = string
    outbound_type           = string
    private_cluster_enabled = bool
    addons = object({
      app_gateway        = bool
      microsoft_defender = bool
    })
    default_node_pool = object({
      enable_auto_scaling = bool
      min_count           = number
      max_count           = number
    })
  }))
}
