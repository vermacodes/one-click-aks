output "aks_login" {
  value = "az aks get-credentials --name ${azurerm_kubernetes_cluster.this.name} --resource-group ${azurerm_kubernetes_cluster.this.resource_group_name} --overwrite-existing"
  description = "AKS Get Credentials Command."
}

output "cluster_name" {
  value = "${azurerm_kubernetes_cluster.this.name}"
  description = "AKS Cluster Name"
}