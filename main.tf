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

# Providing a reference to our default VPC
resource "aws_default_vpc" "default_vpc" {
}

# Providing a reference to our default subnets
resource "aws_default_subnet" "default_subnet_a" {
  availability_zone = "ap-southeast-2a"
}

resource "aws_default_subnet" "default_subnet_b" {
  availability_zone = "ap-southeast-2b"
}

resource "aws_default_subnet" "default_subnet_c" {
  availability_zone = "ap-southeast-2c"
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "ecs_task_execution_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}


resource "aws_alb" "application_load_balancer" {
  name               = "hills-carpal-prod-lb-tf" # Naming our load balancer
  load_balancer_type = "application"
  subnets = [ # Referencing the default subnets
    "${aws_default_subnet.default_subnet_a.id}",
    "${aws_default_subnet.default_subnet_b.id}",
    "${aws_default_subnet.default_subnet_c.id}"
  ]
  # Referencing the security group
  security_groups = ["${aws_security_group.load_balancer_security_group.id}"]
}

# Creating a security group for the load balancer:
resource "aws_security_group" "load_balancer_security_group" {
  ingress {
    from_port   = 80 # Allowing traffic in from port 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic in from all sources
  }

  ingress {
    from_port   = 1024 # Allowing traffic in from port 80
    to_port     = 1024
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic in from all sources
  }

  egress {
    from_port   = 0             # Allowing any incoming port
    to_port     = 0             # Allowing any outgoing port
    protocol    = "-1"          # Allowing any outgoing protocol 
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic out to all IP addresses
  }
}

module "prod_db" {
  source                  = "./terraform/modules/database"
  vpc                     = aws_default_vpc.default_vpc
  database_id             = "prod"
}

module "dev_db" {
  source                  = "./terraform/modules/database"
  vpc                     = aws_default_vpc.default_vpc
  database_id             = "dev"
}

module "bastion" {
  source                  = "./terraform/modules/bastion"
}

module "prod" {
  source                  = "./terraform/modules/common-infra"
  docker_image_tag        = "082e511489bd55ad85c165ae5ec3ce00d497d2f0"
  environment_id          = "prod"
  ecs_task_execution_role = aws_iam_role.ecs_task_execution_role
  hills_carpal_repo       = aws_ecr_repository.hills-carpal-repo
  vpc                     = aws_default_vpc.default_vpc
  default_subnet_a        = aws_default_subnet.default_subnet_a
  default_subnet_b        = aws_default_subnet.default_subnet_b
  default_subnet_c        = aws_default_subnet.default_subnet_c
  external_url            = "https://ride.carpal.org.au"
  require_user_role       = "prod"
  environment_name        = "Production"
  load_balancer_security_group = aws_security_group.load_balancer_security_group
  load_balancer           = aws_alb.application_load_balancer
  load_balancer_port      = 80
  db_instance             = module.prod_db.db
}

module "training" {
  source                  = "./terraform/modules/common-infra"
  docker_image_tag        = "082e511489bd55ad85c165ae5ec3ce00d497d2f0"
  environment_id          = "training"
  ecs_task_execution_role = aws_iam_role.ecs_task_execution_role
  hills_carpal_repo       = aws_ecr_repository.hills-carpal-repo
  vpc                     = aws_default_vpc.default_vpc
  default_subnet_a        = aws_default_subnet.default_subnet_a
  default_subnet_b        = aws_default_subnet.default_subnet_b
  default_subnet_c        = aws_default_subnet.default_subnet_c
  external_url            = "https://training.ride.carpal.org.au"
  require_user_role       = "training"
  environment_name        = "Training"
  load_balancer_security_group = aws_security_group.load_balancer_security_group
  load_balancer           = aws_alb.application_load_balancer
  load_balancer_port      = 1024
  db_instance             = module.dev_db.db
}
