resource "aws_default_vpc" "default" {}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

resource "aws_instance" "bastion" {
  key_name                    = "${aws_key_pair.bastion_key.key_name}"
  instance_type               = "t2.nano"
  security_groups             = ["${aws_security_group.bastion-sg.name}"]
  associate_public_ip_address = true

  ami                         = data.aws_ami.ubuntu.id
}

resource "aws_security_group" "bastion-sg" {
  name   = "bastion-security-group"
  vpc_id = "${aws_default_vpc.default.id}"

  ingress {
    protocol    = "tcp"
    from_port   = 22
    to_port     = 22
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    protocol    = -1
    from_port   = 0 
    to_port     = 0 
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_eip" "eip" {
  instance = aws_instance.bastion.id
  vpc      = true
}

resource "aws_key_pair" "bastion_key" {
  key_name   = "hills-carpal-aws"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDFwzLDAmnpkJHT3DxIeqa1XcqESjeIrCYggvnG9lBwb221AvRcvCpGCaMh7G9QckkfThTevQLUDjUQLb5i8j3tWIOUEgSuExz2mwy+QNhgR6jju4UWGCdKEeF545Bz3S8ibNWrVzwf9n2e9z3LmgSMBcrK4+Sumc2fJw7MHfKQuXk6VGtZfj+738qUsFA6pZEZAJlSWtFbE4Ftg3LTrXWVJptzQS2I9lzaXDDiUMqhyaUXo0tHeahyhGKbk9PmXqh1bU4rR5T/vSg9abfGSYmv/cW0JHwYx7xGQBGOCV+ZHunfHpAuQxCjWqNv8fN9MDKHY/e+U1q872BE5NkLx4Ug6HyGImyBOuQed29Kz1NK74B98hoc3Ql7zVMDSQm4zglXBb1eLLC4vRV52snJE9rS2mFI/d6pCq9XlzVIC/sbRayN4kDbgU65mTf59lH9oYiM9oTwVFy3ISeUyLiVY3EjuadE6senNLvtrvWJ8V8oMFLLszdyTPHK87CyACtbglRgYNbao4ppR7buNci50ESKaP9znbS8sAjH8d5BW2jdCvk6uTuBa7Tb9Jl4P+Kh3/4aXn89BdxMCbez0b4aqOwavY1fxZwPeV1djY5UV/TrDtImro87UUJJHGMWVr1m+YyUC8ZN7EdYnolFOlmMtEOCBao1kxCswIN4qDSKZXsaxQ== alex@alexgilleran.com"
}

output "bastion_public_ip" {
  value = "${aws_instance.bastion.public_ip}"
}

output "bastion_private_ip" {
  value = "${aws_instance.bastion.private_ip}"
}
