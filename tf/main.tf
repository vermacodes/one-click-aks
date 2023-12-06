data "http" "my_ip" {
  url = "https://api.ipify.org"
}

resource "random_string" "random" {
  length  = 4
  upper   = false
  numeric = false
  special = false
}

module "naming" {
  source = "Azure/naming/azurerm"
  prefix = ["${terraform.workspace}", "${random_string.random.result}"]
}
