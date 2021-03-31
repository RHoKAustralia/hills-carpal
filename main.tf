provider "aws" {
  version = "~> 2.0"
  region  = "ap-southeast-2"
  profile = "hills-carpal"
}

module "prod" {
  source           = "./terraform/modules/common-infra"
  docker_image_tag = "22"
  environment_id   = "prod"
  ami_id           = "ami-020e17478ee31e7a8"
}

# module "training" {
#   source           = "./terraform/modules/common-infra"
#   docker_image_tag = "22"
#   environment_id   = "training"
# }
