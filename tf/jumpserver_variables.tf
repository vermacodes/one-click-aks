variable "jumpservers" {
  description = "Jump Server"
  type = list(object({
    admin_username = string
    admin_password = string
  }))
  default = []
}