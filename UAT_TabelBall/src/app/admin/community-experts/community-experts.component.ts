import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommunityExpertsService } from 'src/app/core/service/api/community-experts.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-community-experts',
  templateUrl: './community-experts.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class CommunityExpertsComponent implements OnInit {
  experts: any[] = []; // เก็บข้อมูลเซียนทั้งหมด
  expertForm: FormGroup; // ฟอร์มสำหรับการเพิ่มเซียนใหม่
  editForm: FormGroup; // ฟอร์มสำหรับการแก้ไขข้อมูลเซียน
  showModal: boolean = false; // แสดง/ซ่อน modal สำหรับแก้ไข
  imageFileName: string = ''; // ชื่อไฟล์ของรูปภาพที่อัปโหลด
  selectedExpert: any = null; // เก็บข้อมูลเซียนที่เลือกสำหรับแก้ไข

  constructor(
    private expertsService: CommunityExpertsService,
    private fb: FormBuilder
  ) {
    // ฟอร์มสำหรับการเพิ่มข้อมูลเซียนใหม่
    this.expertForm = this.fb.group({
      expert_name: ['', Validators.required],
      stat_percentage: [0],
      match_detail: [''],
      betting_tip: [''],
      image: [null],
      round1: ['ไม่ทราบ'],
      round2: ['ไม่ทราบ'],
      round3: ['ไม่ทราบ'],
      round4: ['ไม่ทราบ'],
      round5: ['ไม่ทราบ'],
      round6: ['ไม่ทราบ'],
      round7: ['ไม่ทราบ'],
      round8: ['ไม่ทราบ'],
      round9: ['ไม่ทราบ'],
      round10: ['ไม่ทราบ']
    });

    // ฟอร์มสำหรับการแก้ไขข้อมูลเซียน
    this.editForm = this.fb.group({
      expert_name: ['', Validators.required],
      stat_percentage: [0],
      match_detail: [''],
      betting_tip: [''],
      image: [null],
      round1: ['ไม่ทราบ'],
      round2: ['ไม่ทราบ'],
      round3: ['ไม่ทราบ'],
      round4: ['ไม่ทราบ'],
      round5: ['ไม่ทราบ'],
      round6: ['ไม่ทราบ'],
      round7: ['ไม่ทราบ'],
      round8: ['ไม่ทราบ'],
      round9: ['ไม่ทราบ'],
      round10: ['ไม่ทราบ']
    });

    // คำนวณเปอร์เซ็นต์ความถูกต้องเมื่อมีการเปลี่ยนแปลงในฟอร์ม
    this.expertForm.valueChanges.subscribe(() => this.calculateStatPercentage(this.expertForm));
    this.editForm.valueChanges.subscribe(() => this.calculateStatPercentage(this.editForm));
  }

  ngOnInit(): void {
    this.loadExperts(); // โหลดข้อมูลเซียนบอลเมื่อ component ทำงาน
  }

  // โหลดข้อมูลจาก backend และแปลง JSON ของ pick_rounds เป็น object
  loadExperts(): void {
    this.expertsService.getAllExperts().subscribe({
      next: (data) => {
        this.experts = data.map((expert) => {
          if (expert.pick_rounds) {
            expert.pick_rounds = JSON.parse(expert.pick_rounds); // แปลง JSON เป็น object
          }
          return expert;
        });
      },
      error: (err) => console.error('Error loading experts:', err)
    });
  }

  // เมื่อเลือกไฟล์รูปภาพใหม่
  onFileSelected(event: any, form: FormGroup): void {
    const file = event.target.files[0];
    if (file) {
      this.imageFileName = file.name;
      form.patchValue({ image: file });
    }
  }

  // เพิ่มเซียนใหม่
  addExpert(): void {
    const formData = this.createFormData(this.expertForm);
    this.expertsService.addExpert(formData).subscribe({
      next: () => {
        this.loadExperts();
        this.expertForm.reset();
        this.imageFileName = '';
      },
      error: (err) => console.error('Error adding expert:', err)
    });
  }

  // เปิด modal สำหรับแก้ไขข้อมูล
  openEditModal(expert: any): void {
    this.selectedExpert = expert;
    this.editForm.patchValue({
      expert_name: expert.name,
      stat_percentage: expert.stat_percentage,
      match_detail: expert.match_detail,
      betting_tip: expert.betting_tip,
      round1: expert.pick_rounds?.round1 || 'ไม่ทราบ',
      round2: expert.pick_rounds?.round2 || 'ไม่ทราบ',
      round3: expert.pick_rounds?.round3 || 'ไม่ทราบ',
      round4: expert.pick_rounds?.round4 || 'ไม่ทราบ',
      round5: expert.pick_rounds?.round5 || 'ไม่ทราบ',
      round6: expert.pick_rounds?.round6 || 'ไม่ทราบ',
      round7: expert.pick_rounds?.round7 || 'ไม่ทราบ',
      round8: expert.pick_rounds?.round8 || 'ไม่ทราบ',
      round9: expert.pick_rounds?.round9 || 'ไม่ทราบ',
      round10: expert.pick_rounds?.round10 || 'ไม่ทราบ'
    });
    this.showModal = true;
  }

  // อัปเดตข้อมูลเซียน
  updateExpert(): void {
    const formData = this.createFormData(this.editForm);
    if (!this.editForm.get('image')?.value && this.selectedExpert.image_url) {
      formData.append('existing_image_url', this.selectedExpert.image_url); // ใช้รูปภาพเดิมถ้าไม่ได้อัปโหลดใหม่
    }
    this.expertsService.updateExpert(this.selectedExpert.id, formData).subscribe({
      next: () => {
        this.loadExperts();
        this.closeEditModal();
      },
      error: (err) => console.error('Error updating expert:', err)
    });
  }

  // ปิด modal สำหรับแก้ไข
  closeEditModal(): void {
    this.showModal = false;
    this.selectedExpert = null;
    this.editForm.reset();
  }

  // ฟังก์ชันสำหรับลบเซียน โดยเพิ่มการยืนยันการลบข้อมูล
  deleteExpert(id: number): void {
    if (confirm('คุณแน่ใจหรือว่าต้องการลบข้อมูลนี้?')) {
      this.expertsService.deleteExpert(id).subscribe({
        next: () => this.loadExperts(),
        error: (err) => console.error('Error deleting expert:', err)
      });
    }
  }

  // ดึงรายการรอบที่ 1-10 สำหรับการแสดงผล
  getRounds(): number[] {
    return Array.from({ length: 10 }, (_, index) => index + 1);
  }

  // คำนวณเปอร์เซ็นต์ความถูกต้องของการทำนาย
  calculateStatPercentage(form: FormGroup): void {
    let correctCount = 0;
    const totalRounds = 10;

    for (let i = 1; i <= totalRounds; i++) {
      const roundValue = form.get(`round${i}`)?.value;
      if (roundValue === 'ถูก') {
        correctCount++;
      }
    }

    const percentage = (correctCount / totalRounds) * 100;
    form.patchValue({ stat_percentage: percentage });
  }

  // สร้าง FormData สำหรับส่งข้อมูล
  private createFormData(form: FormGroup): FormData {
    const formData = new FormData();
    formData.append('expert_name', form.get('expert_name')?.value);
    formData.append('stat_percentage', form.get('stat_percentage')?.value);
    formData.append('match_detail', form.get('match_detail')?.value);
    formData.append('betting_tip', form.get('betting_tip')?.value);

    for (let i = 1; i <= 10; i++) {
      formData.append(`round${i}`, form.get(`round${i}`)?.value);
    }

    if (form.get('image')?.value) {
      formData.append('image', form.get('image')?.value);
    }

    return formData;
  }

  // ดึงไอคอนที่เหมาะสมตามผลการทำนาย
  getIconForRound(roundResult: string): string {
    const baseUrl = 'http://127.0.0.1:5000/static/uploads/img_community_expert/';
    switch (roundResult) {
      case 'ถูก':
        return `${baseUrl}check-icon.svg`;
      case 'ผิด':
        return `${baseUrl}cross-icon.svg`;
      default:
        return `${baseUrl}minus-icon.svg`;
    }
  }

  // แสดงผลการทำนายของแต่ละรอบ
  getRoundResult(pick: any, round: number): string {
    return pick.pick_rounds[`round${round}`] || 'ไม่ทราบผล';
  }
}
