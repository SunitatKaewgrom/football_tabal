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
  experts: any[] = [];
  expertForm: FormGroup;
  editForm: FormGroup;
  showModal: boolean = false;
  imageFileName: string = '';
  selectedExpert: any = null;

  constructor(
    private expertsService: CommunityExpertsService,
    private fb: FormBuilder
  ) {
    // Form สำหรับการเพิ่มข้อมูลใหม่
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

    // Form สำหรับการแก้ไขข้อมูล
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

    // คำนวณเปอร์เซ็นต์อัตโนมัติเมื่อมีการเปลี่ยนแปลงค่าใน expertForm
    this.expertForm.valueChanges.subscribe(() => this.calculateStatPercentage(this.expertForm));

    // คำนวณเปอร์เซ็นต์อัตโนมัติเมื่อมีการเปลี่ยนแปลงค่าใน editForm
    this.editForm.valueChanges.subscribe(() => this.calculateStatPercentage(this.editForm));
  }

  ngOnInit(): void {
    this.loadExperts();
  }

  loadExperts(): void {
    this.expertsService.getAllExperts().subscribe({
      next: (data) => (this.experts = data),
      error: (err) => console.error('Error loading experts:', err)
    });
  }

  onFileSelected(event: any, form: FormGroup): void {
    const file = event.target.files[0];
    if (file) {
      this.imageFileName = file.name;
      form.patchValue({ image: file });
    }
  }

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

  openEditModal(expert: any): void {
    this.selectedExpert = expert;

    // ทำการดึงค่าทุกฟิลด์ใน `expert` มาแสดงใน `editForm`
    this.editForm.patchValue({
      expert_name: expert.name,  // ใช้ 'name' แทน 'expert_name' เนื่องจาก field ในฐานข้อมูลใช้ชื่อว่า name
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

    //this.imageFileName = expert.image_url || '';  // ตั้งค่า URL ของรูปภาพที่เก็บไว้
    this.showModal = true;  // เปิด modal
}


  updateExpert(): void {
    const formData = this.createFormData(this.editForm);
    this.expertsService.updateExpert(this.selectedExpert.id, formData).subscribe({
      next: () => {
        this.loadExperts();
        this.closeEditModal();
      },
      error: (err) => console.error('Error updating expert:', err)
    });
  }

  closeEditModal(): void {
    this.showModal = false;
    this.selectedExpert = null;
    this.editForm.reset();
  }

  deleteExpert(id: number): void {
    this.expertsService.deleteExpert(id).subscribe({
      next: () => this.loadExperts(),
      error: (err) => console.error('Error deleting expert:', err)
    });
  }

  getRounds(): number[] {
    return Array.from({ length: 10 }, (_, index) => index + 1);
  }

  calculateStatPercentage(form: FormGroup): void {
    let correctCount = 0;
    const totalRounds = 10;

    for (let i = 1; i <= totalRounds; i++) {
      const roundValue = form.get(`round${i}`)?.value;
      if (roundValue === 'ถูก') {
        correctCount++;
      }
    }

    // คำนวณเปอร์เซ็นต์จากจำนวน 'ถูก' และอัปเดตค่า stat_percentage
    const percentage = (correctCount / totalRounds) * 100;
    form.patchValue({ stat_percentage: percentage });
  }

  private createFormData(form: FormGroup): FormData {
    const formData = new FormData();
    formData.append('name', form.get('name')?.value);
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
}
