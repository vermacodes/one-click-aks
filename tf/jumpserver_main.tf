resource "azurerm_public_ip" "this" {
  count               = var.jumpservers == null ? 0 : length(var.jumpservers)
  name                = module.naming.public_ip.name
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
  sku                 = "Basic"
  allocation_method   = "Dynamic"
}

resource "azurerm_network_interface" "this" {
  count               = var.jumpservers == null ? 0 : length(var.jumpservers)
  name                = module.naming.network_interface.name
  location            = azurerm_resource_group.this.location
  resource_group_name = azurerm_resource_group.this.name

  ip_configuration {
    name                          = "${module.naming.network_interface.name}-ip"
    subnet_id                     = azurerm_subnet.this[1].id // Second subnet must be for jump server.
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.this[0].id
  }
}

resource "azurerm_virtual_machine" "this" {
  count                            = var.jumpservers == null ? 0 : length(var.jumpservers)
  name                             = module.naming.virtual_machine.name
  location                         = azurerm_resource_group.this.location
  resource_group_name              = azurerm_resource_group.this.name
  network_interface_ids            = [azurerm_network_interface.this[0].id]
  vm_size                          = "Standard_DS1_v2"
  delete_os_disk_on_termination    = true
  delete_data_disks_on_termination = true

  storage_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }
  storage_os_disk {
    name              = "osdisk"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Standard_LRS"
  }
  os_profile {
    computer_name  = "jumpserver"
    admin_username = var.jumpservers[0].admin_username
    admin_password = var.jumpservers[0].admin_password
  }
  os_profile_linux_config {
    disable_password_authentication = false
  }
}
