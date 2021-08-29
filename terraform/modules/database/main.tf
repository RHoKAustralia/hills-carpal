resource "aws_security_group" "db_security_group" {
  # name = "${var.database_id}-rds-sg"
  description = "RDS (terraform-managed) ${var.database_id}"
  vpc_id      = var.vpc.id # Referencing the default VPC

  # Only MySQL in
  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = [var.vpc.cidr_block]
  }

  # Allow all outbound traffic.
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "hills-carpal-db" {
  identifier              = "hillscarpal-db-${var.database_id}"
  allocated_storage       = 20
  engine                  = "mysql"
  engine_version          = "5.7"
  instance_class          = "db.t3.micro"
  name                    = "carpal"
  username                = "foo"
  password                = "foobarbaz" # Change this to a password of your choice!
  parameter_group_name    = "makedumpswork" #"default.mysql5.7"
  backup_retention_period = 3
  deletion_protection     = true
  publicly_accessible     = true
  apply_immediately       = true
  storage_encrypted       = true
  vpc_security_group_ids  = ["${aws_security_group.db_security_group.id}"]
  skip_final_snapshot     = true
}

output "db" {
    value = aws_db_instance.hills-carpal-db
}