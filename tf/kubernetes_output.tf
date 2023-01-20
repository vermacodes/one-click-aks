output "aks_login" {
  value       = length(var.kubernetes_clusters) == 0 ? "" : "az aks get-credentials --name ${azurerm_kubernetes_cluster.this[0].name} --resource-group ${azurerm_kubernetes_cluster.this[0].resource_group_name} --overwrite-existing"
  description = "AKS Get Credentials Command."
}

output "cluster_name" {
  value       = length(var.kubernetes_clusters) == 0 ? "" : azurerm_kubernetes_cluster.this[0].name
  description = "AKS Cluster Name"
}

output "cluster_version" {
  value       = length(var.kubernetes_clusters) == 0 ? "" : azurerm_kubernetes_cluster.this[0].kubernetes_version
  description = "AKS Cluster Name"
}

output "cluster_msi_id" {
  value       = length(var.kubernetes_clusters) == 0 ? "" : azurerm_user_assigned_identity.ccp_identity[0].id
  description = "The Principal ID associated with this Managed Service Identity"
}

output "cluster_msi_client_id" {
  value       = length(var.kubernetes_clusters) == 0 ? "" : azurerm_user_assigned_identity.ccp_identity[0].client_id
  description = "The Principal ID associated with this Managed Service Identity"
}

output "cluster_msi_principal_id" {
  value       = length(var.kubernetes_clusters) == 0 ? "" : azurerm_user_assigned_identity.ccp_identity[0].principal_id
  description = "The Principal ID associated with this Managed Service Identity"
}

output "kubelet_msi_id" {
  value       = length(var.kubernetes_clusters) == 0 ? "" : azurerm_user_assigned_identity.kubelet_identity[0].id
  description = "ID of User assigned Identity for kubelet"
}

output "kubelet_msi_client_id" {
  value       = length(var.kubernetes_clusters) == 0 ? "" : azurerm_user_assigned_identity.kubelet_identity[0].client_id
  description = "ID of User assigned Identity for kubelet"
}
output "kubelet_msi_principal_id" {
  value       = length(var.kubernetes_clusters) == 0 ? "" : azurerm_user_assigned_identity.kubelet_identity[0].principal_id
  description = "ID of User assigned Identity for kubelet"
}
