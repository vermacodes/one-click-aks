variable "app_gateways" {
  type = list(object({
    // An empty object will trigger ACR to be created.
  }))
  default = []
}
