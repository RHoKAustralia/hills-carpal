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
      "image": "${aws_ecr_repository.hills-carpal-repo.repository_url}:6",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000
        }
      ],
      "memory": 512,
      "cpu": 256,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
            "awslogs-group": "awslogs-hills-carpal-prod",
            "awslogs-region": "ap-southeast-2",
            "awslogs-stream-prefix": "hills-carpal-prod"
        }
      },
      "secrets": [
        {
          "name": "MYSQL_PW",
          "valueFrom": "${aws_secretsmanager_secret.hills-carpal-secret-prod.arn}:MYSQL_PW::"
        },
        {
          "name": "MYSQL_USER",
          "valueFrom": "${aws_secretsmanager_secret.hills-carpal-secret-prod.arn}:MYSQL_USER::"
        },
        {
          "name": "AUTH0_CLIENT_SECRET",
          "valueFrom": "${aws_secretsmanager_secret.hills-carpal-secret-prod.arn}:AUTH0_CLIENT_SECRET::"
        },
        {
          "name": "SMTP_USERNAME",
          "valueFrom": "${aws_secretsmanager_secret.hills-carpal-secret-prod.arn}:SMTP_USERNAME::"
        },
        {
          "name": "SMTP_PASSWORD",
          "valueFrom": "${aws_secretsmanager_secret.hills-carpal-secret-prod.arn}:SMTP_PASSWORD::"
        }
      ],
      "environment": [
          {"name": "MYSQL_HOST", "value": "${aws_db_instance.hills-carpal-db-prod.address}"},
          {"name": "MYSQL_PORT", "value": "${aws_db_instance.hills-carpal-db-prod.port}"}
      ]
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode             = "awsvpc"    # Using awsvpc as our network mode as this is required for Fargate
  memory                   = 512         # Specifying the memory our container requires
  cpu                      = 256         # Specifying the CPU our container requires
  execution_role_arn       = aws_iam_role.ecsTaskExecutionRole.arn
}

resource "aws_cloudwatch_log_group" "awslogs-hills-carpal-prod" {
  name = "awslogs-hills-carpal-prod"
}

resource "aws_iam_role" "ecsTaskExecutionRole" {
  name               = "ecsTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json

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

resource "aws_secretsmanager_secret" "hills-carpal-secret-prod" {
  name = "hills-carpal-secret-prod"
}

data "aws_iam_policy_document" "get_access_to_secrets" {
  statement {
    effect = "Allow"

    actions = [
      "secretsmanager:GetSecretValue"
    ]

    resources = [
      "${aws_secretsmanager_secret.hills-carpal-secret-prod.arn}"
    ]
  }
}

resource "aws_iam_policy" "get_access_to_secrets" {
  name = "get-access-to-secrets"

  policy = data.aws_iam_policy_document.get_access_to_secrets.json
}

resource "aws_iam_role_policy_attachment" "test-attach" {
  role       = aws_iam_role.ecsTaskExecutionRole.name
  policy_arn = aws_iam_policy.get_access_to_secrets.arn
}

resource "aws_iam_role_policy_attachment" "ecsTaskExecutionRole_policy" {
  role       = aws_iam_role.ecsTaskExecutionRole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_service" "hills-carpal-service-prod" {
  name            = "hills-carpal-service-prod"                        # Naming our first service
  cluster         = aws_ecs_cluster.hills-carpal-cluster-prod.id       # Referencing our created Cluster
  task_definition = aws_ecs_task_definition.hills-carpal-task-prod.arn # Referencing the task our service will spin up
  launch_type     = "FARGATE"
  desired_count   = 1

  load_balancer {
    target_group_arn = aws_lb_target_group.target_group.arn # Referencing our target group
    container_name   = aws_ecs_task_definition.hills-carpal-task-prod.family
    container_port   = 3000 # Specifying the container port
  }

  network_configuration {
    subnets          = ["${aws_default_subnet.default_subnet_a.id}", "${aws_default_subnet.default_subnet_b.id}", "${aws_default_subnet.default_subnet_c.id}"]
    assign_public_ip = true                                                # Providing our containers with public IPs
    security_groups  = ["${aws_security_group.service_security_group.id}"] # Setting the security group
  }
}

resource "aws_security_group" "service_security_group" {
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    # Only allowing traffic in from the load balancer security group
    security_groups = ["${aws_security_group.load_balancer_security_group.id}"]
  }

  egress {
    from_port   = 0             # Allowing any incoming port
    to_port     = 0             # Allowing any outgoing port
    protocol    = "-1"          # Allowing any outgoing protocol 
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic out to all IP addresses
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

  egress {
    from_port   = 0             # Allowing any incoming port
    to_port     = 0             # Allowing any outgoing port
    protocol    = "-1"          # Allowing any outgoing protocol 
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic out to all IP addresses
  }
}
resource "aws_lb_target_group" "target_group" {
  name        = "target-group"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_default_vpc.default_vpc.id # Referencing the default VPC

  health_check {
    healthy_threshold   = "2"
    unhealthy_threshold = "6"
    interval            = "30"
    matcher             = "200,301,302"
    path                = "/"
    protocol            = "HTTP"
    timeout             = "5"
  }
}

resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_alb.application_load_balancer.arn # Referencing our load balancer
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target_group.arn # Referencing our tagrte group
  }
}
resource "aws_db_instance" "hills-carpal-db-prod" {
  allocated_storage       = 20
  engine                  = "mysql"
  engine_version          = "5.7"
  instance_class          = "db.t2.micro"
  name                    = "carpal"
  username                = "foo"
  password                = "foobarbaz" # Note that this is just the password when it's created, we change it right away :)
  parameter_group_name    = "default.mysql5.7"
  backup_retention_period = 3
  deletion_protection     = true
}
