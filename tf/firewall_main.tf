resource "azurerm_public_ip" "firewall_pip" {
  count               = var.firewalls == null ? 0 : length(var.firewalls)
  name                = module.naming.firewall_ip_configuration.name
  location            = azurerm_resource_group.this.location
  resource_group_name = azurerm_resource_group.this.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

resource "azurerm_firewall" "this" {
  count               = var.firewalls == null ? 0 : length(var.firewalls)
  name                = module.naming.firewall.name
  location            = azurerm_resource_group.this.location
  resource_group_name = azurerm_resource_group.this.name
  sku_name            = var.firewalls[count.index].sku_name
  sku_tier            = var.firewalls[count.index].sku_tier

  ip_configuration {
    name                 = azurerm_public_ip.firewall_pip[0].name
    subnet_id            = azurerm_subnet.this[0].id
    public_ip_address_id = azurerm_public_ip.firewall_pip[0].id
  }
}

resource "azurerm_firewall_network_rule_collection" "network_rules_collection" {
  count               = var.firewalls == null ? 0 : length(var.firewalls) == 0 ? 0 : length(var.firewall_network_rules)
  name                = var.firewall_network_rules[count.index].name
  resource_group_name = azurerm_resource_group.this.name
  azure_firewall_name = azurerm_firewall.this[0].name
  priority            = var.firewall_network_rules[count.index].priority
  action              = var.firewall_network_rules[count.index].action

  dynamic "rule" {
    for_each = coalesce(lookup(var.firewall_network_rules[count.index], "rules"), [])
    content {
      name                  = rule.value.name
      description           = rule.value.description
      source_addresses      = rule.value.source_addresses
      destination_ports     = rule.value.destination_ports
      destination_addresses = rule.value.destination_addresses
      protocols             = rule.value.protocols
    }
  }
}

# resource "azurerm_firewall_nat_rule_collection" "nat_rule_collection" {
#   count      = var.firewalls == null ? 0 : length(var.firewalls)
#   for_each            = var.firewall_nat_rules
#   name                = each.value["name"]
#   resource_group_name = var.resource_group_name
#   azure_firewall_name = azurerm_firewall.firewall.name
#   priority            = each.value["priority"]
#   action              = "Dnat"

#   dynamic "rule" {
#     for_each = coalesce(lookup(each.value, "rules"), [])
#     content {
#       name                  = rule.value.name
#       description           = rule.value.description
#       source_addresses      = rule.value.source_addresses
#       destination_ports     = rule.value.destination_ports
#       destination_addresses = list(lookup(azurerm_public_ip.firewall_pip, each.value["firewall_key"])["ip_address"])
#       protocols             = rule.value.protocols
#       translated_address    = rule.value.translated_address
#       translated_port       = rule.value.translated_port
#     }
#   }
# }

resource "azurerm_firewall_application_rule_collection" "app_rules_collection" {
  count               = var.firewalls == null ? 0 : length(var.firewalls) == 0 ? 0 : length(var.firewall_network_rules)
  name                = var.firewall_application_rules[count.index].name
  resource_group_name = azurerm_resource_group.this.name
  azure_firewall_name = azurerm_firewall.this[0].name
  priority            = var.firewall_application_rules[count.index].priority
  action              = var.firewall_application_rules[count.index].action

  dynamic "rule" {
    for_each = coalesce(lookup(var.firewall_application_rules[count.index], "rules"), [])
    content {
      name             = rule.value.name
      source_addresses = rule.value.source_addresses
      #fqdn_tags        = lookup(rule.value, "target_fqdns", null) == null && lookup(rule.value, "fqdn_tags", null) != null ? rule.value.fqdn_tags : []
      target_fqdns = lookup(rule.value, "fqdn_tags", null) == null && lookup(rule.value, "target_fqdns", null) != null ? rule.value.target_fqdns : []

      dynamic "protocol" {
        #for_each = lookup(rule.value, "target_fqdns", null) != null && lookup(rule.value, "fqdn_tags", null) == null ? lookup(rule.value, "protocol", []) : []
        for_each = lookup(rule.value, "target_fqdns", null) != null ? lookup(rule.value, "protocol", []) : []
        content {
          port = lookup(protocol.value, "port", null)
          type = protocol.value.type
        }
      }
    }
  }
}
