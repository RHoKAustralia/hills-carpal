provider "aws" {
  version = "~> 2.0"
  region  = "ap-southeast-2"
  profile = "hills-carpal"
}
  
resource "aws_ecr_repository" "hills-carpal-repo" {
  name = "hills-carpal-repo"
}