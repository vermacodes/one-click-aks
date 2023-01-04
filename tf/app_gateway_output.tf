# output "app_gateway_name" {
#   value = var.app_gateways == null ? "" : length(var.app_gateways) == 0 ? "" : azurerm_application_gateway.this[0].name
# }

# output "app_gateway_frontend_private_ip" {
#   value = var.app_gateways == null ? "" : length(var.app_gateways) == 0 ? "" : azurerm_application_gateway.this[0].frontend_ip_configuration[0].private_ip_address
# }

# output "app_gateway_frontend_public_ip" {
#   value = var.app_gateways == null ? "" : length(var.app_gateways) == 0 ? "" : azurerm_public_ip.app_gateway[0].ip_address
# }
