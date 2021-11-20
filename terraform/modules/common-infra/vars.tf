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

variable "vpc" {}
variable "default_subnet_a" {} 
variable "default_subnet_b" {}
variable "default_subnet_c" {}
variable "load_balancer_security_group" {}
variable "load_balancer" {}
variable "load_balancer_port" {
  type = number
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

variable "db_instance" {}

variable "backup_google_sheet_id" {}