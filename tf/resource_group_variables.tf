variable "resource_group" {
  description = "Resource Group"
  type = object({
    location = string
  })
  default = {
    location ="eastus"
  }
}