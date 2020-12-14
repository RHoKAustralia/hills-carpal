provider "aws" {
  version = "~> 2.0"
  region  = "ap-southeast-2"
  profile = "hills-carpal"
}
  
resource "aws_ecr_repository" "hills-carpal-repo" {
  name = "hills-carpal-repo"
}

resource "aws_ecs_cluster" "hills-carpal-cluster-prod" {
  name = "hills-carpal-cluster-prod" # Naming the cluster
}

resource "aws_ecs_task_definition" "hills-carpal-task-prod" {
  family                   = "hills-carpal-task-prod" # Naming our first task
  container_definitions    = <<DEFINITION
  [
    {
      "name": "hills-carpal-task-prod",
      "image": "${aws_ecr_repository.hills-carpal-repo.repository_url}",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000
        }
      ],
      "memory": 512,
      "cpu": 256
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 512         # Specifying the memory our container requires
  cpu                      = 256         # Specifying the CPU our container requires
  execution_role_arn       = "${aws_iam_role.ecsTaskExecutionRole.arn}"
}

resource "aws_iam_role" "ecsTaskExecutionRole" {
  name               = "ecsTaskExecutionRole"
  assume_role_policy = "${data.aws_iam_policy_document.assume_role_policy.json}"
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

resource "aws_iam_role_policy_attachment" "ecsTaskExecutionRole_policy" {
  role       = "${aws_iam_role.ecsTaskExecutionRole.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_service" "hills-carpal-service-prod" {
  name            = "hills-carpal-service-prod"                             # Naming our first service
  cluster         = "${aws_ecs_cluster.hills-carpal-cluster-prod.id}"             # Referencing our created Cluster
  task_definition = "${aws_ecs_task_definition.hills-carpal-task-prod.arn}" # Referencing the task our service will spin up
  launch_type     = "FARGATE"
  desired_count   = 1 # Setting the number of containers we want deployed to 3
}