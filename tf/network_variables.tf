# variable "custom_virtual_network" {
#   description = "Set this to true to deploy networking resources. By default VNET is not deployed"
#   type        = bool
#   default     = false
# }

variable "virtual_networks" {
  description = "Virtual Network"
  type = list(object({
    address_space = list(string)
  }))
  default = []
}

variable "subnets" {
  description = "Subnets"
  type = list(object({
    name             = string
    address_prefixes = list(string)
  }))
  default = []
}

variable "network_security_groups" {
  description = "Network Security Groups"
  type = list(object({
  }))
  default = []
}
