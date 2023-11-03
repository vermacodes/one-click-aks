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
      app_gateway              = bool
      microsoft_defender       = bool
      virtual_node             = bool
      http_application_routing = bool
      service_mesh = object({
        enabled                          = bool
        mode                             = string
        internal_ingress_gateway_enabled = bool
        external_ingress_gateway_enabled = bool
      })
    })
    default_node_pool = object({
      enable_auto_scaling = bool
      min_count           = number
      max_count           = number
    })
  }))
}
