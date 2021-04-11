data "aws_iam_policy_document" "get_access_to_secrets" {
  statement {
    effect = "Allow"

    actions = [
      "secretsmanager:GetSecretValue"
    ]

    resources = [
      "${aws_secretsmanager_secret.hills-carpal-secret.arn}"
    ]
  }
}

resource "aws_iam_policy" "get_access_to_secrets" {
  name = "get-access-to-secrets-${var.environment_id}"

  policy = data.aws_iam_policy_document.get_access_to_secrets.json
}

resource "aws_iam_role_policy_attachment" "test-attach" {
  role       = var.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.get_access_to_secrets.arn
}

resource "aws_ecs_cluster" "hills-carpal-cluster" {
  name = "hills-carpal-cluster-${var.environment_id}" # Naming the cluster
}

resource "aws_secretsmanager_secret" "hills-carpal-secret" {
  name = "hills-carpal-secret-${var.environment_id}"
}

resource "aws_ecs_task_definition" "hills-carpal-task" {
  family                = "hills-carpal-task-${var.environment_id}" # Naming our first task
  container_definitions = <<DEFINITION
  [
    {
      "name": "hills-carpal-task-${var.environment_id}",
      "image": "${var.hills_carpal_repo.repository_url}:${var.docker_image_tag}",
      "essential": true,
      "memory": 256,
      "cpu": 10,
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
            "awslogs-group": "awslogs-hills-carpal-${var.environment_id}",
            "awslogs-region": "ap-southeast-2",
            "awslogs-stream-prefix": "hills-carpal-${var.environment_id}"
        }
      },
      "secrets": [
        {
          "name": "MYSQL_PW",
          "valueFrom": "${aws_secretsmanager_secret.hills-carpal-secret.arn}:MYSQL_PW::"
        },
        {
          "name": "MYSQL_USER",
          "valueFrom": "${aws_secretsmanager_secret.hills-carpal-secret.arn}:MYSQL_USER::"
        },
        {
          "name": "AUTH0_CLIENT_SECRET",
          "valueFrom": "${aws_secretsmanager_secret.hills-carpal-secret.arn}:AUTH0_CLIENT_SECRET::"
        },
        {
          "name": "SMTP_USERNAME",
          "valueFrom": "${aws_secretsmanager_secret.hills-carpal-secret.arn}:SMTP_USERNAME::"
        },
        {
          "name": "SMTP_PASSWORD",
          "valueFrom": "${aws_secretsmanager_secret.hills-carpal-secret.arn}:SMTP_PASSWORD::"
        }
      ],
      "environment": [
          {"name": "MYSQL_HOST", "value": "${aws_db_instance.hills-carpal-db.address}"},
          {"name": "MYSQL_PORT", "value": "${aws_db_instance.hills-carpal-db.port}"},
          {"name": "EXTERNAL_URL", "value": "${var.external_url}"},
          {"name": "REQUIRE_USER_ROLE", "value": "${var.require_user_role}"}
      ]
    }
  ]
  DEFINITION
  # requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode = "host"
  # memory                   = 512         # Specifying the memory our container requires
  # cpu                      = 256         # Specifying the CPU our container requires
  execution_role_arn = var.ecs_task_execution_role.arn
}

resource "aws_cloudwatch_log_group" "awslogs-hills-carpal" {
  name = "awslogs-hills-carpal-${var.environment_id}"
}

resource "aws_ecs_service" "hills-carpal-service" {
  name                               = "hills-carpal-service-${var.environment_id}"  # Naming our first service
  cluster                            = aws_ecs_cluster.hills-carpal-cluster.id       # Referencing our created Cluster
  task_definition                    = aws_ecs_task_definition.hills-carpal-task.arn # Referencing the task our service will spin up
  launch_type                        = "EC2"
  desired_count                      = 1
  deployment_minimum_healthy_percent = 0

  # load_balancer {
  #   target_group_arn = aws_lb_target_group.target_group.arn # Referencing our target group
  #   container_name   = aws_ecs_task_definition.hills-carpal-task-prod.family
  #   container_port   = 3000 # Specifying the container port
  # }

  # network_configuration {
  #   subnets          = ["${aws_default_subnet.default_subnet_a.id}", "${aws_default_subnet.default_subnet_b.id}", "${aws_default_subnet.default_subnet_c.id}"]
  #   # assign_public_ip = true                                                # Providing our containers with public IPs
  #   security_groups  = ["${aws_security_group.service_security_group.id}"] # Setting the security group
  # }
}

resource "aws_security_group" "service_security_group" {
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    # Only allowing traffic in from the load balancer security group
    # security_groups = ["${aws_security_group.load_balancer_security_group.id}"]
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

# resource "aws_alb" "application_load_balancer" {
#   name               = "hills-carpal-prod-lb-tf" # Naming our load balancer
#   load_balancer_type = "application"
#   subnets = [ # Referencing the default subnets
#     "${aws_default_subnet.default_subnet_a.id}",
#     "${aws_default_subnet.default_subnet_b.id}",
#     "${aws_default_subnet.default_subnet_c.id}"
#   ]
#   # Referencing the security group
#   security_groups = ["${aws_security_group.load_balancer_security_group.id}"]
# }

# Creating a security group for the load balancer:
# resource "aws_security_group" "load_balancer_security_group" {
#   ingress {
#     from_port   = 80 # Allowing traffic in from port 80
#     to_port     = 80
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"] # Allowing traffic in from all sources
#   }

#   egress {
#     from_port   = 0             # Allowing any incoming port
#     to_port     = 0             # Allowing any outgoing port
#     protocol    = "-1"          # Allowing any outgoing protocol 
#     cidr_blocks = ["0.0.0.0/0"] # Allowing traffic out to all IP addresses
#   }
# }
# resource "aws_lb_target_group" "target_group" {
#   name        = "target-group"
#   port        = 80
#   protocol    = "HTTP"
#   target_type = "ip"
#   vpc_id      = aws_default_vpc.default_vpc.id # Referencing the default VPC

#   health_check {
#     healthy_threshold   = "2"
#     unhealthy_threshold = "6"
#     interval            = "30"
#     matcher             = "200,301,302"
#     path                = "/"
#     protocol            = "HTTP"
#     timeout             = "5"
#   }
# }

# resource "aws_lb_listener" "listener" {
#   load_balancer_arn = aws_alb.application_load_balancer.arn # Referencing our load balancer
#   port              = "80"
#   protocol          = "HTTP"
#   default_action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.target_group.arn # Referencing our tagrte group
#   }
# }
resource "aws_db_instance" "hills-carpal-db" {
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
  publicly_accessible     = true
  apply_immediately       = true
}

data "aws_ami" "amazon_linux_ecs" {
  most_recent = true

  owners = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn-ami-*-amazon-ecs-optimized"]
  }

  filter {
    name   = "owner-alias"
    values = ["amazon"]
  }
}

data "aws_iam_policy_document" "assume_role_policy_ec2" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecsInstanceRole" {
  name               = "ecsInstanceRole-${var.environment_id}"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy_ec2.json
}

resource "aws_iam_role_policy_attachment" "attach-ec2-container-service" {
  role       = aws_iam_role.ecsInstanceRole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecsInstanceProfile" {
  name = "ecs-instance-profile-${var.environment_id}"
  role = aws_iam_role.ecsInstanceRole.name
}

resource "aws_instance" "web" {
  ami                  = coalesce(var.ami_id, data.aws_ami.amazon_linux_ecs.id)
  instance_type        = "t2.nano"
  iam_instance_profile = aws_iam_instance_profile.ecsInstanceProfile.name
  user_data            = <<EOF
#!/bin/bash
echo ECS_CLUSTER=hills-carpal-cluster-${var.environment_id} >> /etc/ecs/ecs.config
EOF
  tags = {
    Name = "HillsCarpal-${var.environment_id}"
  }
}

resource "aws_eip" "ip" {
  instance = aws_instance.web.id
  vpc      = true
  tags     = {
    environment: var.environment_id
  }
}

resource "aws_cloudwatch_event_rule" "daily_cron" {
  name        = "daily_cron-${var.environment_id}"
  description = "Daily cron - happens every morning Sydney time"

  schedule_expression = "cron(0 22 * * ? *)"
}

resource "aws_cloudwatch_event_target" "sns" {
  rule      = aws_cloudwatch_event_rule.daily_cron.name
  target_id = "SendToSNS"
  arn       = aws_sns_topic.daily_cron.arn
}

resource "aws_sns_topic" "daily_cron" {
  name = "daily-cron-${var.environment_id}"
}

resource "aws_sns_topic_policy" "default" {
  arn    = aws_sns_topic.daily_cron.arn
  policy = data.aws_iam_policy_document.sns_topic_policy.json
}

data "aws_iam_policy_document" "sns_topic_policy" {
  statement {
    effect  = "Allow"
    actions = ["SNS:Publish"]

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }

    resources = [aws_sns_topic.daily_cron.arn]
  }
}

resource "aws_sns_topic_subscription" "app_sns_target" {
  topic_arn              = aws_sns_topic.daily_cron.arn
  protocol               = "https"
  endpoint               = "${var.external_url}/api/send-reminders"
  endpoint_auto_confirms = true
}
