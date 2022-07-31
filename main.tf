

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

  linux_profile {
    admin_username = "ashish"
    ssh_key {
      key_data = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCnmgq5Bdw72IRqJdm6vImQ1A7mTMNmlCYjYZgIZPgkHoQGVepidzk83nvuHMOtQ8W+hxJxrgSyYSP1+7e3giJx8OrcW7pXie7lE/XQjR4HKfJuB0IUqo+m+I5hxNPSRhuilQmPKVqpc7OcHVSVEh7ghG8TWjjCXTSWic0K2p2z3RVzZv79ThtIG561ekWbZjnWBZWxs9A0QTX9ItSRIGyS7yVYzFHSxswKHDFghQrkL9bqbfgMfPE0kcIeHgMOhnjMDXDHdIzTIwZgB9EwMDXXXkyefYXs1EFGHgi5E/bSMVoRj2eVzTL+urFMJOkL3por12cRiX0DLw1pUMDNsU4PBxbUrFbkP/h8bKBSBJbq5Hln8lQlbMUzo4YUPaEFL+Zp4SCJNzg7j9+300956OLJ6Vrd8EAO3yAMdem/cCL3kn8GDgVf1Gvp6j5dRbCv+WJnXfsnTyx4rgF33URDYJGGZgiNVJYnfBAekSEQ7c/6ztVvaDw9UdrXj7XtvxSzk0c= ashish@Ashish-Zbook"
    }
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
