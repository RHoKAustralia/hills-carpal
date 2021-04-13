provider "aws" {
  version = "~> 2.0"
  region  = "ap-southeast-2"
  profile = "hills-carpal"
}

resource "aws_ecr_repository" "hills-carpal-repo" {
  name = "hills-carpal-repo"
}


data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "ecs_task_execution_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

module "prod" {
  source                  = "./terraform/modules/common-infra"
  docker_image_tag        = "28"
  environment_id          = "prod"
  ecs_task_execution_role = aws_iam_role.ecs_task_execution_role
  hills_carpal_repo       = aws_ecr_repository.hills-carpal-repo
  external_url            = "https://ride.carpal.org.au"
  require_user_role       = "prod"
}

module "training" {
  source                  = "./terraform/modules/common-infra"
  docker_image_tag        = "28"
  environment_id          = "training"
  ami_id                  = "ami-020e17478ee31e7a8"
  ecs_task_execution_role = aws_iam_role.ecs_task_execution_role
  hills_carpal_repo       = aws_ecr_repository.hills-carpal-repo
  external_url            = "https://training.ride.carpal.org.au"
}
