import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { TipsTableService } from 'src/app/core/service/api/tips-table.service';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tips-table',
  templateUrl: './tips-table.component.html',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TipsTableComponent implements OnInit {
  tipsForm: FormGroup;
  experts: any[] = [];
  leagues: any[] = [];
  teams: any[] = [];
  dataLoaded: boolean = false;

  constructor(
    private fb: FormBuilder,
    private tipsTableService: TipsTableService,
    private cdr: ChangeDetectorRef
  ) {
    this.tipsForm = this.fb.group({
      matches: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    forkJoin({
      experts: this.tipsTableService.getAllExperts(),
      leagues: this.tipsTableService.getAllLeagues(),
      teams: this.tipsTableService.getAllTeams()
    }).subscribe((data) => {
      this.experts = data.experts;
      this.leagues = data.leagues;
      this.teams = data.teams;
      this.dataLoaded = true;
      this.cdr.markForCheck();
    });
  }

  // ฟังก์ชันเข้าถึง matches FormArray
  get matches(): FormArray {
    return this.tipsForm.get('matches') as FormArray;
  }

  // สร้าง match FormGroup ใหม่
  createMatchGroup(): FormGroup {
    return this.fb.group({
      homeTeam: ['', Validators.required],
      date: ['', Validators.required],
      odds: ['', Validators.required],
      homeScore: [0, Validators.required],
      awayTeam: ['', Validators.required],
      time: ['', Validators.required],
      league: ['', Validators.required],
      awayScore: [0, Validators.required],
      expertPredictions: this.fb.array([]),
    });
  }

  // สร้าง expertPrediction FormGroup
  createExpertPredictionGroup(): FormGroup {
    return this.fb.group({
      expertId: ['', Validators.required],
      analysis: ['', Validators.required],
      link: ['', Validators.required],
      prediction: ['win', Validators.required],
    });
  }

  // เพิ่ม match ใน matches array
  addMatch(): void {
    const matchGroup = this.createMatchGroup();
    this.matches.push(matchGroup);
    this.cdr.markForCheck();
  }

  // ลบ match ใน matches array
  removeMatch(index: number): void {
    this.matches.removeAt(index);
    this.cdr.markForCheck();
  }

  // เพิ่ม expertPrediction ใน match ที่กำหนด
  addExpertPrediction(matchIndex: number): void {
    const expertPredictions = this.getExpertPredictions(matchIndex);
    expertPredictions.push(this.createExpertPredictionGroup());
    this.cdr.markForCheck();
  }

  // เข้าถึง expertPredictions array ใน match
  getExpertPredictions(matchIndex: number): FormArray {
    return this.matches.at(matchIndex).get('expertPredictions') as FormArray;
  }

  // ลบ expertPrediction ใน match ที่กำหนด
  removeExpertPrediction(matchIndex: number, predictionIndex: number): void {
    this.getExpertPredictions(matchIndex).removeAt(predictionIndex);
    this.cdr.markForCheck();
  }

  // ส่งข้อมูล form ไปยัง backend
  onSubmit(): void {
    if (this.tipsForm.valid) {
      this.tipsTableService.addTipsPrediction(this.tipsForm.value).subscribe(
        response => console.log('Submission successful:', response),
        error => console.error('Submission error:', error)
      );
    }
  }

  // trackBy สำหรับ ngFor
  trackByIndex(index: number): any {
    return index;
  }
}
