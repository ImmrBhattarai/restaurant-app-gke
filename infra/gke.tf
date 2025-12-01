resource "google_container_cluster" "primary" {
  # References variables defined in variables.tf and terraform.tfvars
  name                     = var.cluster_name
  location                 = var.zone
  project                  = var.project_id
  network                  = google_compute_network.vpc.name
  subnetwork               = google_compute_subnetwork.subnet.name
  initial_node_count       = 1 

  # The services_ipv4_cidr attribute is computed by GCP and cannot be set here.
  # We omit it and allow GKE to match the existing cluster's value.

  # Configuration for VPC-native cluster networking (Pods only)
  ip_allocation_policy {
    # Pods use the secondary IP range 'gke-pods' from the subnetwork
    cluster_secondary_range_name = "gke-pods"
  }

  # Remove default node pool as we define a custom one below
  remove_default_node_pool = true

  # Recommended security/management settings
  enable_shielded_nodes = true
  
  # Configure logging and monitoring
  logging_config {
    enable_components = ["SYSTEM_COMPONENTS", "WORKLOADS"]
  }

  monitoring_config {
    enable_components = ["SYSTEM_COMPONENTS"]
  }
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "default-pool"
  location   = google_container_cluster.primary.location
  cluster    = google_container_cluster.primary.name

  node_count = 1

  node_config {
    machine_type = "e2-small" 
    disk_size_gb = 20      
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
    metadata = {
      disable-legacy-endpoints = "true"
    }
  }

  autoscaling {
    min_node_count = 1
    max_node_count = 1
  }
}
