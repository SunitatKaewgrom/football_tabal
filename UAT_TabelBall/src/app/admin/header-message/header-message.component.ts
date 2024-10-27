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
  description = '';
  linkUrl = '';
  fileName = 'ไม่ได้เลือกไฟล์ใด';
  selectedFile: File | null = null;

  exampleDescription: string = '';
  exampleLinkUrl: string = '';
  exampleImageUrl: string = '';

  constructor(private headerMessageService: HeaderMessageService) {}

  ngOnInit(): void {
    this.loadExampleMessage();
  }

  loadExampleMessage(): void {
    this.headerMessageService.getMessages().subscribe((data) => {
        if (data && data.description) {
            this.exampleDescription = data.description;
            this.exampleLinkUrl = data.link_url;
            this.exampleImageUrl = `http://localhost:5000/static/uploads/${data.image_url}`;
        }
    });
}


  onSubmit(): void {
    const formData = new FormData();
    formData.append('description', this.description);
    formData.append('link_url', this.linkUrl);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    this.headerMessageService.addMessage(formData).subscribe(() => {
      this.loadExampleMessage();
      this.description = '';
      this.linkUrl = '';
      this.fileName = 'ไม่ได้เลือกไฟล์ใด';
      this.selectedFile = null;
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.selectedFile = file;
    }
  }
}