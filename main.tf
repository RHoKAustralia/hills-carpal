terraform {
  required_providers {
    aws = {
      version = "~> 5"
    }
  }
}

provider "aws" {
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
  assign_generated_ipv6_cidr_block = true
}

# Providing a reference to our default subnets
resource "aws_default_subnet" "default_subnet_a" {
  availability_zone       = "ap-southeast-2a"
  map_public_ip_on_launch = false
  ipv6_cidr_block         = cidrsubnet(aws_default_vpc.default_vpc.ipv6_cidr_block, 8, 0)

}

resource "aws_default_subnet" "default_subnet_b" {
  availability_zone       = "ap-southeast-2b"
  map_public_ip_on_launch = false
  ipv6_cidr_block         = cidrsubnet(aws_default_vpc.default_vpc.ipv6_cidr_block, 8, 1)
}

resource "aws_default_subnet" "default_subnet_c" {
  availability_zone       = "ap-southeast-2c"
  map_public_ip_on_launch = false
  ipv6_cidr_block         = cidrsubnet(aws_default_vpc.default_vpc.ipv6_cidr_block, 8, 2)
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
  enable_http2               = true
  enable_deletion_protection = true
  # Referencing the security group
  security_groups = ["${aws_security_group.load_balancer_security_group.id}"]
  ip_address_type = "dualstack"
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
  source      = "./terraform/modules/database"
  vpc         = aws_default_vpc.default_vpc
  database_id = "prod"
}

module "dev_db" {
  source      = "./terraform/modules/database"
  vpc         = aws_default_vpc.default_vpc
  database_id = "dev"
}

module "bastion" {
  source = "./terraform/modules/bastion"
  vpc         = aws_default_vpc.default_vpc
}

module "prod" {
  source                       = "./terraform/modules/common-infra"
  docker_image_tag             = "ad5058328d59ee40e0f318fa668dca207a51ed2d"
  environment_id               = "prod"
  ecs_task_execution_role      = aws_iam_role.ecs_task_execution_role
  hills_carpal_repo            = aws_ecr_repository.hills-carpal-repo
  vpc                          = aws_default_vpc.default_vpc
  default_subnet_a             = aws_default_subnet.default_subnet_a
  default_subnet_b             = aws_default_subnet.default_subnet_b
  default_subnet_c             = aws_default_subnet.default_subnet_c
  external_url                 = "https://ride.carpal.org.au"
  require_user_role            = "prod"
  environment_name             = "Production"
  load_balancer_security_group = aws_security_group.load_balancer_security_group
  load_balancer                = aws_alb.application_load_balancer
  load_balancer_port           = 80
  db_instance                  = module.prod_db.db
  backup_google_sheet_id       = "1MFfENxjTsva5NZbzi9ArF2JS9NHv4ZxfkA0IJzhp8rM"
  ecs_task_revision            = 68
}

module "training" {
  source                       = "./terraform/modules/common-infra"
  docker_image_tag             = "ad5058328d59ee40e0f318fa668dca207a51ed2d"
  environment_id               = "training"
  ecs_task_execution_role      = aws_iam_role.ecs_task_execution_role
  hills_carpal_repo            = aws_ecr_repository.hills-carpal-repo
  vpc                          = aws_default_vpc.default_vpc
  default_subnet_a             = aws_default_subnet.default_subnet_a
  default_subnet_b             = aws_default_subnet.default_subnet_b
  default_subnet_c             = aws_default_subnet.default_subnet_c
  external_url                 = "https://training.ride.carpal.org.au"
  require_user_role            = "training"
  environment_name             = "Training"
  load_balancer_security_group = aws_security_group.load_balancer_security_group
  load_balancer                = aws_alb.application_load_balancer
  load_balancer_port           = 1024
  db_instance                  = module.dev_db.db
  backup_google_sheet_id       = "190aMCZO9QwXU-9dIep6OPkadc4-8T4kW0cHEO8gEXp4"
  ecs_task_revision            = 87
}
