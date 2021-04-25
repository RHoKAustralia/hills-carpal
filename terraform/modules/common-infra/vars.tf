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

variable "ecs_task_execution_role" {
  description = "An aws_iam_role to run the ecs tasks in"
}

variable "hills_carpal_repo" {
  description = "An aws_ecr_repository in which to find the docker image"
}

variable "external_url" {
  description = "the external https url"
}

variable "require_user_role" {
  type        = string
  default     = ""
  description = "A user role that must be set on any user accessing this deployment"
}

variable "environment_name" {
  type        = string
  description = "The name of this environment"
}
