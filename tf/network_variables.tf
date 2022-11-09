variable "custom_virtual_network" {
  description = "Set this to true to deploy networking resources. By default VNET is not deployed"
  type        = bool
  default     = false
}

variable "virtual_networks" {
  description = "Virtual Network"
  type = list(object({
    address_space = list(string)
  }))
  default = [{
    address_space = ["10.1.0.0/16"]
  }]
}

variable "subnets" {
  description = "Subnets"
  type = list(object({
    name             = string
    address_prefixes = list(string)
  }))
  default = [{
    address_prefixes = ["10.1.1.0/24"]
    name             = "AzureFirewallSubnet"
    },
    {
      address_prefixes = ["10.1.2.0/24"]
      name             = "JumpServerSubnet"
    },
    {
      address_prefixes = ["10.1.3.0/24"]
      name             = "KubernetesSubnet"
  }]
}

variable "nsg" {
  description = "Network Security Groups"
  type = list(object({
    name = string
  }))
  default = [ {
    name = "nsg"
  }]
}