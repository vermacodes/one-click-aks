variable "container_registries" {
  type = list(object({
    // An empty object will trigger ACR to be created.
  }))
  default = []
}
