variable "proxmox_api_url" {
  description = "Proxmox API URL"
  type        = string
  default     = "https://10.10.20.1:8006/api2/json"
}

variable "proxmox_user" {
  description = "Proxmox user"
  type        = string
  default     = "root@pam"
}

variable "proxmox_password" {
  description = "Proxmox password"
  type        = string
  sensitive   = true
}

variable "proxmox_node" {
  description = "Proxmox node name"
  type        = string
  default     = "pve"
}

variable "template_name" {
  description = "VM template to clone"
  type        = string
  default     = "ubuntu-2404-template"
}

variable "vm_cores" {
  description = "Number of CPU cores"
  type        = number
  default     = 4
}

variable "vm_memory" {
  description = "Memory in MB"
  type        = number
  default     = 4096
}

variable "vm_disk_size" {
  description = "Disk size"
  type        = string
  default     = "30G"
}

variable "storage_pool" {
  description = "Proxmox storage pool"
  type        = string
  default     = "local-lvm"
}

variable "ci_user" {
  description = "Cloud-init user"
  type        = string
  default     = "onesto"
}

variable "ci_password" {
  description = "Cloud-init password"
  type        = string
  sensitive   = true
}

variable "ssh_public_key" {
  description = "SSH public key for cloud-init"
  type        = string
}
