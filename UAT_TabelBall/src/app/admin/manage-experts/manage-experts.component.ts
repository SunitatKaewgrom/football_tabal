// src/app/admin/manage-experts/manage-experts.component.ts

import { Component, OnInit } from '@angular/core';
import { ExpertService } from 'src/app/core/service/api/experts.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-experts',
  templateUrl: './manage-experts.component.html',
  styleUrls: ['./manage-experts.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ManageExpertsComponent implements OnInit {
  experts: any[] = [];
  newExpert = { name: '', imageFile: undefined as File | undefined };
  selectedExpert: { id: number; name: string; imageFile?: File } | null = null;
  imageFileName: string | null = null;

  constructor(private expertService: ExpertService) {}

  ngOnInit(): void {
    this.loadExperts();
  }

  // โหลดข้อมูลเซียนบอลทั้งหมด
  loadExperts(): void {
    this.expertService.getExperts().subscribe({
      next: (data) => {
        this.experts = data;
      },
      error: (error) => {
        console.error('Error loading experts:', error);
      }
    });
  }

  // เพิ่มเซียนบอลใหม่
  addExpert(): void {
    if (this.newExpert.name) {
      this.expertService.createExpert(this.newExpert.name, this.newExpert.imageFile).subscribe({
        next: () => {
          this.loadExperts(); // โหลดข้อมูลเซียนบอลใหม่
          this.newExpert = { name: '', imageFile: undefined };
          this.imageFileName = null;
        },
        error: (error) => {
          console.error('Error creating expert:', error);
        }
      });
    } else {
      alert("กรุณาใส่ชื่อเซียนบอล");
    }
  }

  // แก้ไขเซียนบอล
  editExpert(expert: any): void {
    this.selectedExpert = { id: expert.id, name: expert.name, imageFile: undefined };
    this.imageFileName = null;
  }

  // อัปเดตข้อมูลเซียนบอล
  updateExpert(): void {
    if (this.selectedExpert && this.selectedExpert.name) {
      this.expertService.updateExpert(this.selectedExpert.id, this.selectedExpert.name, this.selectedExpert.imageFile).subscribe({
        next: () => {
          this.loadExperts(); // โหลดข้อมูลเซียนบอลใหม่
          this.selectedExpert = null;
          this.imageFileName = null;
        },
        error: (error) => {
          console.error('Error updating expert:', error);
        }
      });
    } else {
      alert("กรุณาเลือกเซียนบอลที่ต้องการอัปเดต");
    }
  }

  // ลบเซียนบอล
  deleteExpert(id: number): void {
    if (confirm("คุณแน่ใจว่าต้องการลบเซียนบอลนี้หรือไม่?")) {
      this.expertService.deleteExpert(id).subscribe({
        next: () => {
          this.loadExperts(); // โหลดข้อมูลเซียนบอลใหม่
        },
        error: (error) => {
          console.error('Error deleting expert:', error);
        }
      });
    }
  }

  // จัดการกับไฟล์รูปภาพที่อัปโหลด
  onFileSelected(event: any, type: string): void {
    const file: File = event.target.files[0];
    if (file) {
      if (type === 'new') {
        this.newExpert.imageFile = file;
        this.imageFileName = file.name;
      } else if (type === 'edit' && this.selectedExpert) {
        this.selectedExpert.imageFile = file;
        this.imageFileName = file.name;
      }
    }
  }

  // ยกเลิกการแก้ไข
  cancelEdit(): void {
    this.selectedExpert = null;
    this.imageFileName = null;
  }
}
