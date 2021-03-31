variable "docker_image_tag" {
  description = "The tag of the docker image to deploy"
  type        = string
}

variable "environment_id" {
  description = "An id for this environment, to be used when creating unique ids"
  type        = string
}

variable "ami_id" {
  description = "Override for the ami id to stop it from continually recreating"
  type        = string
  default     = null
}
