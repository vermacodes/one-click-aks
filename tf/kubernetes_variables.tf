variable "kubernetes_cluster" {
  description = "AKS Cluster Object"
  type = object({
   network_plugin = string
   network_policy = string
   private_cluster_enabled = bool
  })
  default = {
    network_plugin = "azure"
    network_policy = null
    private_cluster_enabled = false
  }
}