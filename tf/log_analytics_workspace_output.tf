output "log_analytics_workspace_resource_id" {
  value       = var.kubernetes_cluster.addons.microsoft_defender ? azurerm_log_analytics_workspace.this[0].id : ""
  description = "The Log Analytics Workspace ID."
}

output "log_analytics_workspace_id" {
  value       = var.kubernetes_cluster.addons.microsoft_defender ? azurerm_log_analytics_workspace.this[0].workspace_id : ""
  description = "The Workspace (or Customer) ID for the Log Analytics Workspace."
}
