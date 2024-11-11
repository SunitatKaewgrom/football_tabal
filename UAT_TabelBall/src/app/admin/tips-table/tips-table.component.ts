import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators ,ReactiveFormsModule } from '@angular/forms';
import { TipsTableService } from 'src/app/core/service/api/tips-table.service';
import { CommonModule } from '@angular/common';
import { Observable, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-tips-table',
  templateUrl: './tips-table.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class TipsTableComponent implements OnInit {
  tipsForm: FormGroup;
  experts$: Observable<any[]> = of([]);  // กำหนดค่าเริ่มต้นเป็น Observable ที่ว่าง
  leagues$: Observable<any[]> = of([]);  // กำหนดค่าเริ่มต้นเป็น Observable ที่ว่าง
  teams$: Observable<any[]> = of([]);    // กำหนดค่าเริ่มต้นเป็น Observable ที่ว่าง

  constructor(private fb: FormBuilder, private tipsTableService: TipsTableService) {
    this.tipsForm = this.fb.group({
      matches: this.fb.array([])  // กำหนด array ของ matches
    });
  }

  ngOnInit(): void {
    // ใช้ forkJoin เพื่อดึงข้อมูลทั้งหมดในครั้งเดียวและเก็บไว้ใน Observables
    forkJoin({
      experts: this.tipsTableService.getAllExperts(),
      leagues: this.tipsTableService.getAllLeagues(),
      teams: this.tipsTableService.getAllTeams()
    }).subscribe((data) => {
      this.experts$ = of(data.experts);
      this.leagues$ = of(data.leagues);
      this.teams$ = of(data.teams);
    });
  }

  // ฟังก์ชันเพื่อเข้าถึง matches array ใน form group
  get matches(): FormArray {
    return this.tipsForm.get('matches') as FormArray;
  }

  // เพิ่ม match group ใหม่ใน matches array
  addMatch(): void {
    const matchGroup = this.fb.group({
      homeTeam: ['', Validators.required],
      date: ['', Validators.required],
      odds: ['', Validators.required],
      homeScore: [0, Validators.required],
      awayTeam: ['', Validators.required],
      time: ['', Validators.required],
      league: ['', Validators.required],
      awayScore: [0, Validators.required],
      expertPredictions: this.fb.array([])  // Array สำหรับการทายผลของเซียนใน match
    });
    this.matches.push(matchGroup);
  }

  // ลบ match group จาก matches array ตาม index
  removeMatch(index: number): void {
    this.matches.removeAt(index);
  }

  // ฟังก์ชันเพื่อเข้าถึง expertPredictions array ใน match group
  getExpertPredictions(matchIndex: number): FormArray {
    return this.matches.at(matchIndex).get('expertPredictions') as FormArray;
  }

  // เพิ่ม expert prediction ใน match ตาม index ที่กำหนด
  addExpertPrediction(matchIndex: number): void {
    const expertGroup = this.fb.group({
      expertId: ['', Validators.required],
      analysis: ['', Validators.required],
      link: ['', Validators.required],
      prediction: ['win', Validators.required]  // ค่าเริ่มต้นเป็น 'win'
    });
    this.getExpertPredictions(matchIndex).push(expertGroup);
  }

  // ลบ expert prediction ใน match ตาม index ที่กำหนด
  removeExpertPrediction(matchIndex: number, predictionIndex: number): void {
    this.getExpertPredictions(matchIndex).removeAt(predictionIndex);
  }

  // ส่งข้อมูล form ไปยัง service เพื่อบันทึก
  onSubmit(): void {
    if (this.tipsForm.valid) {
      this.tipsTableService.addTipsPrediction(this.tipsForm.value).subscribe(
        response => console.log('Submission successful:', response),
        error => console.error('Submission error:', error)
      );
    }
  }

  // ฟังก์ชัน trackBy เพื่อเพิ่มประสิทธิภาพในการ render *ngFor
  trackByIndex(index: number, obj: any): any {
    return index;
  }
}
