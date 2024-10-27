import { Component } from '@angular/core';
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
export class HeaderMessageComponent {
  description = '';
  linkUrl = '';
  selectedFile: File | null = null;
  fileName = '';  // เพิ่มตัวแปร fileName

  constructor(private headerMessageService: HeaderMessageService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('description', this.description);
    formData.append('link_url', this.linkUrl);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.headerMessageService.addMessage(formData).subscribe(response => {
      console.log(response);  // ตรวจสอบผลลัพธ์ที่ส่งกลับ
    });
  }
}
