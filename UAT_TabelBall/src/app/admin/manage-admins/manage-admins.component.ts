import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from 'src/app/core/service/api/admin.service';

interface Admin {
  id: number;
  username: string;
  password?: string;
}

@Component({
  selector: 'app-manage-admins',
  templateUrl: './manage-admins.component.html',
  styleUrls: ['./manage-admins.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ManageAdminsComponent implements OnInit {
  admins: Admin[] = [];
  selectedAdmin: Admin | null = null;
  newAdmin: Admin = { id: 0, username: '', password: '' };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    console.log('Initializing ManageAdminsComponent...');
    this.loadAdmins();
  }

  loadAdmins(): void {
    console.log('Loading admins...');
    this.adminService.getAdmins().subscribe((data) => {
      console.log('Admins loaded:', data);
      this.admins = data.map((item: any) => ({
        id: item[0],
        username: item[1],
        password: '' // Do not store hashed password directly
      }));
    });
  }

  addAdmin(): void {
    if (this.newAdmin.username && this.newAdmin.password) {
      console.log('Adding new admin:', this.newAdmin);
      const adminToAdd = { ...this.newAdmin, password: this.newAdmin.password };
      this.adminService.addAdmin(adminToAdd).subscribe(() => {
        console.log('Admin added successfully.');
        this.loadAdmins();
        this.newAdmin = { id: 0, username: '', password: '' };
      });
    }
  }

  editPassword(admin: Admin): void {
    console.log('Editing password for admin:', admin);
    this.selectedAdmin = { ...admin, password: admin.password || '' }; // Initialize selectedAdmin for editing
  }

  updatePassword(): void {
    if (this.selectedAdmin && this.selectedAdmin.password) {
      console.log('Updating password for admin:', this.selectedAdmin);
      this.adminService.updateAdmin(this.selectedAdmin).subscribe(() => {
        console.log('Password updated successfully.');
        this.loadAdmins();
        this.cancelEdit();
      });
    }
  }

  cancelEdit(): void {
    console.log('Cancelling edit.');
    this.selectedAdmin = null;
  }

  deleteAdmin(id: number): void {
    console.log('Deleting admin with ID:', id);
    this.adminService.deleteAdmin(id).subscribe(() => {
      console.log('Admin deleted successfully.');
      this.loadAdmins();
    });
  }
}
