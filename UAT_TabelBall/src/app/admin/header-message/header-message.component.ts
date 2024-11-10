import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderMessageService } from 'src/app/core/service/api/header-message.service';

@Component({
  selector: 'app-header-message',
  templateUrl: './header-message.component.html',
  styleUrls: ['./header-message.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class HeaderMessageComponent implements OnInit {
  description = ''; // ข้อความคำอธิบาย
  linkUrl = ''; // ลิงก์ URL
  fileName = 'ไม่ได้เลือกไฟล์ใด'; // ชื่อไฟล์ที่เลือก
  selectedFile: File | null = null; // ไฟล์ที่ถูกเลือก

  // ตัวอย่างข้อมูลที่แสดงผล
  exampleDescription: string = '';
  exampleLinkUrl: string = '';
  exampleImageUrl: string = '';

  constructor(private headerMessageService: HeaderMessageService) {}

  ngOnInit(): void {
    this.loadExampleMessage(); // โหลดข้อความตัวอย่างเมื่อเริ่มต้นใช้งาน
  }

  // โหลดข้อมูล header message จากเซิร์ฟเวอร์
  loadExampleMessage(): void {
    this.headerMessageService.getMessages().subscribe((data) => {
      console.log("Fetched data: ", data);  // เพิ่มการ Debugging
      if (data && data.description) {
        this.exampleDescription = data.description;
        this.exampleLinkUrl = data.link_url;
        // กำหนด URL ของภาพให้ถูกต้อง
        this.exampleImageUrl = data.image_url ? `http://localhost:5000/static/uploads/img_header_message/${data.image_url}` : '';
      }
    });
  }

  // ฟังก์ชันส่งข้อมูลไปยังเซิร์ฟเวอร์เมื่อกดบันทึก
  onSubmit(): void {
    const formData = new FormData();
    formData.append('description', this.description); // เพิ่มคำอธิบายลงในฟอร์ม
    formData.append('link_url', this.linkUrl); // เพิ่มลิงก์ลงในฟอร์ม
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name); // เพิ่มรูปภาพที่เลือกลงในฟอร์ม
    }

    this.headerMessageService.addMessage(formData).subscribe({
      next: () => {
        this.loadExampleMessage(); // โหลดข้อมูลใหม่หลังบันทึกสำเร็จ
        this.description = ''; // รีเซ็ตฟิลด์
        this.linkUrl = '';
        this.fileName = 'ไม่ได้เลือกไฟล์ใด';
        this.selectedFile = null;
      },
      error: (error) => {
        console.error('Error creating header message:', error);
      }
    });
  }

  // ฟังก์ชันเลือกไฟล์รูปภาพจากผู้ใช้
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name; // อัปเดตชื่อไฟล์ที่เลือก
      this.selectedFile = file; // เก็บไฟล์ที่เลือกไว้ใน selectedFile
    }
  }
}
