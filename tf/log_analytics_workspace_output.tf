output "log_analytics_workspace_resource_id" {
  value       = length(var.kubernetes_clusters) == 0 ? "" : var.kubernetes_clusters[0].addons.microsoft_defender ? azurerm_log_analytics_workspace.this[0].id : ""
  description = "The Log Analytics Workspace ID."
}

output "log_analytics_workspace_id" {
  value       = length(var.kubernetes_clusters) == 0 ? "" : var.kubernetes_clusters[0].addons.microsoft_defender ? azurerm_log_analytics_workspace.this[0].workspace_id : ""
  description = "The Workspace (or Customer) ID for the Log Analytics Workspace."
}
