output "firewall_public_ip" {
  value = [[for firewall in azurerm_firewall.this : [[for ip in firewall.ip_configuration : ip.name]]]]
}
