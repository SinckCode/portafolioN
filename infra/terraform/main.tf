terraform {
  required_providers {
    proxmox = {
      source  = "Telmate/proxmox"
      version = "~> 3.0"
    }
  }
}

provider "proxmox" {
  pm_api_url      = var.proxmox_api_url
  pm_user         = var.proxmox_user
  pm_password     = var.proxmox_password
  pm_tls_insecure = true
}

resource "proxmox_vm_qemu" "portfolio_server" {
  name        = "portfolio-server"
  target_node = var.proxmox_node
  vmid        = 100

  clone = var.template_name

  cores   = var.vm_cores
  memory  = var.vm_memory
  sockets = 1

  os_type  = "cloud-init"
  bootdisk = "scsi0"

  disk {
    storage = var.storage_pool
    size    = var.vm_disk_size
    type    = "scsi"
  }

  network {
    model  = "virtio"
    bridge = "vmbr1"
  }

  ipconfig0 = "ip=10.10.20.100/24,gw=10.10.20.1"

  ciuser     = var.ci_user
  cipassword = var.ci_password
  sshkeys    = var.ssh_public_key

  lifecycle {
    ignore_changes = [
      disk,
      network,
    ]
  }

  tags = "portfolio,production"
}

output "vm_ip" {
  value = "10.10.20.100"
}

output "ssh_command" {
  value = "ssh ${var.ci_user}@10.10.20.100"
}
