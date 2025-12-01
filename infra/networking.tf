resource "google_compute_network" "vpc" {
  name                    = "restaurant-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "restaurant-subnet"
  ip_cidr_range = "10.10.0.0/16"
  region        = var.region
  network       = google_compute_network.vpc.id

  # Only define the secondary IP range for GKE Pods, using a private CIDR.
  # The name 'gke-pods' is referenced in gke.tf.
  secondary_ip_range {
    range_name    = "gke-pods"
    ip_cidr_range = "10.164.0.0/14"
  }
}
