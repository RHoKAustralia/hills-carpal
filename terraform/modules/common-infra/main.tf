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
        },
        {
          "name": "GOOGLE_PRIVATE_KEY",
          "valueFrom": "${aws_secretsmanager_secret.hills-carpal-secret.arn}:GOOGLE_PRIVATE_KEY::"
        },
        {
          "name": "SURVEY_GOOGLE_SHEET_ID",
          "valueFrom": "${aws_secretsmanager_secret.hills-carpal-secret.arn}:SURVEY_GOOGLE_SHEET_ID::"
        }
      ],
      "environment": [
          {"name": "MYSQL_HOST", "value": "${var.db_instance.address}"},
          {"name": "MYSQL_PORT", "value": "${var.db_instance.port}"},
          {"name": "MYSQL_USE_SSL", "value": "TRUE"},
          {"name": "EXTERNAL_URL", "value": "${var.external_url}"},
          {"name": "REQUIRE_USER_ROLE", "value": "${var.require_user_role}"},
          {"name": "ENVIRONMENT_NAME", "value": "${var.environment_name}"},
          {"name": "GOOGLE_SERVICE_ACCOUNT_EMAIL", "value": "hillscarpalsheets@hills-carpal.iam.gserviceaccount.com"}
      ]
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"] # Stating that we are using ECS Fargate
  network_mode = "awsvpc"
  memory                   = 512         # Specifying the memory our container requires
  cpu                      = 256         # Specifying the CPU our container requires
  execution_role_arn = var.ecs_task_execution_role.arn
}

resource "aws_cloudwatch_log_group" "awslogs-hills-carpal" {
  name = "awslogs-hills-carpal-${var.environment_id}"
}

resource "aws_ecs_service" "hills-carpal-service" {
  name                               = "hills-carpal-service-${var.environment_id}"  # Naming our first service
  cluster                            = aws_ecs_cluster.hills-carpal-cluster.id       # Referencing our created Cluster
  task_definition                    = aws_ecs_task_definition.hills-carpal-task.arn # Referencing the task our service will spin up
  launch_type                        = "FARGATE"
  desired_count                      = 1
  deployment_minimum_healthy_percent = 0

  load_balancer {
    target_group_arn = aws_lb_target_group.target_group.arn # Referencing our target group
    container_name   = aws_ecs_task_definition.hills-carpal-task.family
    container_port   = 3000 # Specifying the container port
  }

  network_configuration {
    subnets          = ["${var.default_subnet_a.id}", "${var.default_subnet_b.id}", "${var.default_subnet_c.id}"]
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
    security_groups = ["${var.load_balancer_security_group.id}"]
  }

  egress {
    from_port   = 0             # Allowing any incoming port
    to_port     = 0             # Allowing any outgoing port
    protocol    = "-1"          # Allowing any outgoing protocol 
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic out to all IP addresses
  }
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

resource "aws_lb_target_group" "target_group" {
  name        = "target-group-${var.environment_id}"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc.id # Referencing the default VPC

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
  load_balancer_arn = var.load_balancer.arn # Referencing our load balancer
  port              = var.load_balancer_port
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target_group.arn # Referencing our tagrte group
  }
}