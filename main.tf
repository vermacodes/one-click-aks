

resource "azurerm_resource_group" "example" {
  name     = "rg"
  location = var.location
}

resource "azurerm_virtual_network" "example" {
  name                = "vnet"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  address_space       = ["10.0.0.0/16"]
  dns_servers         = ["10.0.0.4", "10.0.0.5"]

  tags = {
    environment = "Production"
  }
}

resource "azurerm_subnet" "kubernetes" {
  name = "kubernetes"
  address_prefixes = [ "10.0.0.0/16" ]
  resource_group_name = azurerm_resource_group.example.name
  virtual_network_name = azurerm_virtual_network.example.name
}

# resource "azurerm_container_registry" "acr" {
#   name                = "ashisverma"
#   resource_group_name = azurerm_resource_group.example.name
#   location            = azurerm_resource_group.example.location
#   sku                 = "Premium"
#   admin_enabled       = false
# }

resource "azurerm_kubernetes_cluster" "example" {
  name                = "cluster"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  dns_prefix          = "cluster"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_DS2_v2"
    vnet_subnet_id = azurerm_subnet.kubernetes.id
  }

  network_profile {
    network_plugin = "azure"
    service_cidr = "10.100.0.0/16"
    dns_service_ip = "10.100.0.10"
    docker_bridge_cidr = "10.200.0.0/16"
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = "Production"
  }
}

# resource "azurerm_role_assignment" "example" {
#   principal_id                     = azurerm_kubernetes_cluster.example.kubelet_identity[0].object_id
#   role_definition_name             = "AcrPull"
#   scope                            = azurerm_container_registry.acr.id
#   skip_service_principal_aad_check = true
# }
