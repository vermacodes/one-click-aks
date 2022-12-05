variable "kubernetes_cluster" {
  description = "AKS Cluster Object"
  type = object({
    kubernetes_version      = string
    network_plugin          = string
    network_policy          = string
    outbound_type           = string
    private_cluster_enabled = bool
    default_node_pool = object({
      enable_auto_scaling = bool
      min_count           = number
      max_count           = number
    })
  })
}
