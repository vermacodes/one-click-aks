# # since these variables are re-used - a locals block makes this more maintainable
# locals {
#   backend_address_pool_name      = "${module.naming.application_gateway.name}-beap"
#   frontend_port_name             = "${module.naming.application_gateway.name}-feport"
#   frontend_ip_configuration_name = "${module.naming.application_gateway.name}-feip"
#   http_setting_name              = "${module.naming.application_gateway.name}-be-htst"
#   listener_name                  = "${module.naming.application_gateway.name}-httplstn"
#   request_routing_rule_name      = "${module.naming.application_gateway.name}-rqrt"
#   redirect_configuration_name    = "${module.naming.application_gateway.name}-rdrcfg"
# }

# resource "azurerm_public_ip" "app_gateway" {
#   count               = var.app_gateways == null ? 0 : length(var.app_gateways)
#   name                = "${module.naming.application_gateway.name}-pip"
#   resource_group_name = azurerm_resource_group.this.name
#   location            = azurerm_resource_group.this.location
#   allocation_method   = "Static"
#   sku                 = "Standard"
# }

# resource "azurerm_application_gateway" "this" {
#   count               = var.app_gateways == null ? 0 : length(var.app_gateways)
#   name                = module.naming.application_gateway.name
#   resource_group_name = azurerm_resource_group.this.name
#   location            = azurerm_resource_group.this.location

#   sku {
#     name     = "Standard_v2"
#     tier     = "Standard_v2"
#     capacity = 1
#   }

#   gateway_ip_configuration {
#     name      = "my-gateway-ip-configuration"
#     subnet_id = azurerm_subnet.this[3].id
#   }

#   frontend_port {
#     name = local.frontend_port_name
#     port = 80
#   }

#   frontend_ip_configuration {
#     name                 = local.frontend_ip_configuration_name
#     public_ip_address_id = azurerm_public_ip.app_gateway[0].id
#   }

#   backend_address_pool {
#     name = local.backend_address_pool_name
#   }

#   backend_http_settings {
#     name                  = local.http_setting_name
#     cookie_based_affinity = "Disabled"
#     path                  = "/path1/"
#     port                  = 80
#     protocol              = "Http"
#     request_timeout       = 60
#   }

#   http_listener {
#     name                           = local.listener_name
#     frontend_ip_configuration_name = local.frontend_ip_configuration_name
#     frontend_port_name             = local.frontend_port_name
#     protocol                       = "Http"
#   }

#   request_routing_rule {
#     name                       = local.request_routing_rule_name
#     rule_type                  = "Basic"
#     priority                   = 10000
#     http_listener_name         = local.listener_name
#     backend_address_pool_name  = local.backend_address_pool_name
#     backend_http_settings_name = local.http_setting_name
#   }
# }

// AGIC ID needs following Access

# resource "azurerm_role_assignment" "ingress_app_gateway_rg_reader" {
#   count                = var.kubernetes_cluster.addons.app_gateway ? 1 : 0
#   principal_id         = azurerm_kubernetes_cluster.this.ingress_application_gateway[count.index].ingress_application_gateway_identity[count.index].object_id
#   scope                = azurerm_resource_group.this.id
#   role_definition_name = "Reader"
# }

# resource "azurerm_role_assignment" "ingress_app_gateway_contributor" {
#   count                = var.kubernetes_cluster.addons.app_gateway ? 1 : 0
#   principal_id         = azurerm_kubernetes_cluster.this.ingress_application_gateway[count.index].ingress_application_gateway_identity[count.index].object_id
#   scope                = azurerm_kubernetes_cluster.this.ingress_application_gateway[count.index].effective_gateway_id
#   role_definition_name = "Contributor"
# }
