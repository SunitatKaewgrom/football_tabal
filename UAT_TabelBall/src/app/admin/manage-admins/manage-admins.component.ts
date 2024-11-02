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
        password: '' // ไม่เก็บรหัสผ่านจริงเพื่อความปลอดภัย
      }));
    });
  }

  addAdmin(): void {
    if (this.newAdmin.username && this.newAdmin.password) {
      const adminToAdd = { ...this.newAdmin };
      this.adminService.addAdmin(adminToAdd).subscribe(() => {
        this.loadAdmins();
        this.newAdmin = { id: 0, username: '', password: '' };
      });
    }
  }

  editPassword(admin: Admin): void {
    this.selectedAdmin = { ...admin };
  }

  confirmUpdate(): void {
    if (confirm("คุณต้องการบันทึกการเปลี่ยนแปลงนี้ใช่หรือไม่?")) {
      this.updatePassword();
    }
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

  confirmDelete(id: number): void {
    if (confirm("คุณต้องการลบข้อมูลนี้ใช่หรือไม่?")) {
      this.deleteAdmin(id);
    }
  }

  deleteAdmin(id: number): void {
    this.adminService.deleteAdmin(id).subscribe(() => {
      this.loadAdmins();
    });
  }
}
