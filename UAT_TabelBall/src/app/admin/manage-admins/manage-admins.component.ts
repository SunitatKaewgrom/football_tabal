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
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.adminService.getAdmins().subscribe((data) => {
      this.admins = data.map((item: any) => ({
        id: item[0],
        username: item[1],
        password: '' // Do not store hashed password directly
      }));
    });
  }

  addAdmin(): void {
    if (this.newAdmin.username && this.newAdmin.password) {
      const adminToAdd = { ...this.newAdmin, password: this.newAdmin.password };
      this.adminService.addAdmin(adminToAdd).subscribe(() => {
        this.loadAdmins();
        this.newAdmin = { id: 0, username: '', password: '' };
      });
    }
  }

  editPassword(admin: Admin): void {
    this.selectedAdmin = { ...admin }; // Only editing password for selected admin
  }

  updatePassword(): void {
    if (this.selectedAdmin && this.selectedAdmin.password) {
      this.adminService.updateAdmin(this.selectedAdmin).subscribe(() => {
        this.loadAdmins();
        this.cancelEdit();
      });
    }
  }

  cancelEdit(): void {
    this.selectedAdmin = null;
  }

  deleteAdmin(id: number): void {
    this.adminService.deleteAdmin(id).subscribe(() => {
      this.loadAdmins();
    });
  }
}
