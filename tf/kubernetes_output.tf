output "aks_login" {
  value       = "az aks get-credentials --name ${azurerm_kubernetes_cluster.this.name} --resource-group ${azurerm_kubernetes_cluster.this.resource_group_name} --overwrite-existing"
  description = "AKS Get Credentials Command."
}

output "cluster_name" {
  value       = azurerm_kubernetes_cluster.this.name
  description = "AKS Cluster Name"
}

output "cluster_version" {
  value       = azurerm_kubernetes_cluster.this.kubernetes_version
  description = "AKS Cluster Name"
}

output "cluster_msi_id" {
  value       = azurerm_user_assigned_identity.ccp_identity.id
  description = "The Principal ID associated with this Managed Service Identity"
}

output "kubelet_msi_id" {
  value       = azurerm_user_assigned_identity.kubelet_identity.id
  description = "ID of User assigned Identity for kubelet"
}
