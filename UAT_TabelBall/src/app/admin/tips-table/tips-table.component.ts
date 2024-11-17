import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TipsTableService } from 'src/app/core/service/api/tips-table.service';

@Component({
  selector: 'app-tips-table',
  standalone: true,
  templateUrl: './tips-table.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TipsTableComponent implements OnInit {
  tipsForm: FormGroup; // FormGroup สำหรับจัดการข้อมูลฟอร์ม
  teams: any[] = []; // เก็บข้อมูลทีมทั้งหมด
  leagues: any[] = []; // เก็บข้อมูลลีกทั้งหมด
  experts: any[] = []; // เก็บข้อมูลเซียนบอลทั้งหมด
  dataLoaded: boolean = false; // ใช้ตรวจสอบว่าข้อมูลโหลดเสร็จหรือไม่

  constructor(
    private fb: FormBuilder, // FormBuilder สำหรับสร้างฟอร์ม
    private tipsTableService: TipsTableService, // Service สำหรับดึงข้อมูล
    private cdr: ChangeDetectorRef // สำหรับอัปเดต UI
  ) {
    // สร้าง FormGroup สำหรับฟอร์ม
    this.tipsForm = this.fb.group({
      matches: this.fb.array([]), // Array สำหรับจัดการข้อมูลแมตช์
    });
  }

  ngOnInit(): void {
    // ดึงข้อมูลทีม ลีก และเซียนบอลจาก API
    this.tipsTableService.getAllData().subscribe((data) => {
      this.teams = data.teams;
      this.leagues = data.leagues;
      this.experts = data.experts;
      this.dataLoaded = true; // ตั้งค่าหลังจากโหลดข้อมูลเสร็จ
      this.cdr.markForCheck(); // รีเฟรช UI
    });
  }

  // ฟังก์ชันเข้าถึง matches FormArray
  get matches(): FormArray {
    return this.tipsForm.get('matches') as FormArray;
  }

  // สร้าง match FormGroup ใหม่
  createMatchGroup(): FormGroup {
    return this.fb.group({
      matchStatus: ['not_started', Validators.required], // สถานะการแข่งขัน
      league: ['', Validators.required], // ลีกที่เกี่ยวข้อง
      homeTeam: ['', Validators.required], // ทีมเหย้า
      date: ['', Validators.required], // วันที่แข่งขัน
      odds: ['', Validators.required], // ราคารอง
      homeScore: [0, Validators.required], // คะแนนทีมเหย้า
      awayTeam: ['', Validators.required], // ทีมเยือน
      time: ['', Validators.required], // เวลาการแข่งขัน
      teamAdvantage: ['', Validators.required], // ทีมที่มีข้อได้เปรียบ
      awayScore: [0, Validators.required], // คะแนนทีมเยือน
      expertPredictions: this.fb.array([]), // Array สำหรับการทายผลของเซียน
    });
  }

  // เพิ่ม match
  addMatch(): void {
    this.matches.push(this.createMatchGroup());
    this.cdr.markForCheck();
  }

  // ลบ match
  removeMatch(index: number): void {
    this.matches.removeAt(index);
    this.cdr.markForCheck();
  }

  // เพิ่ม expertPrediction
  addExpertPrediction(matchIndex: number): void {
    const expertPredictions = this.getExpertPredictions(matchIndex);
    expertPredictions.push(this.createExpertPredictionGroup());
    this.cdr.markForCheck();
  }

  // สร้าง expertPrediction FormGroup
  createExpertPredictionGroup(): FormGroup {
    return this.fb.group({
      expertId: ['', Validators.required], // ID ของเซียนบอล
      analysis: ['', Validators.required], // การวิเคราะห์
      link: ['', Validators.required], // ลิงค์การวิเคราะห์
      prediction: ['win', Validators.required], // การทายผล
    });
  }

  // เข้าถึง expertPredictions
  getExpertPredictions(matchIndex: number): FormArray {
    return this.matches.at(matchIndex).get('expertPredictions') as FormArray;
  }

  // ลบ expertPrediction
  removeExpertPrediction(matchIndex: number, predictionIndex: number): void {
    this.getExpertPredictions(matchIndex).removeAt(predictionIndex);
    this.cdr.markForCheck();
  }

  // ฟังก์ชันดึงรูปทีม
  getTeamImage(teamId: string): string | null {
    const team = this.teams.find((t) => t.id.toString() === teamId);
    return team ? `http://127.0.0.1:5000/${team.logo_url}` : null;
  }

  // ฟังก์ชันดึงรูปลีก
  getLeagueImage(leagueId: string): string | null {
    const league = this.leagues.find((l) => l.id.toString() === leagueId);
    return league ? `http://127.0.0.1:5000/${league.logo_url}` : null;
  }

  // ฟังก์ชันดึงรูปเซียนบอล
  getExpertImage(expertId: string): string | null {
    const expert = this.experts.find((e) => e.id.toString() === expertId);
    return expert ? `http://127.0.0.1:5000/${expert.image_url}` : null;
  }

  // ฟังก์ชันบันทึกข้อมูล
  onSubmit(): void {
    if (this.tipsForm.valid) {
      const formData = this.matches.value.map((match: any) => {
        const { expertPredictions, ...matchDetails } = match;
        return {
          matchDetails,
          predictions: expertPredictions.map((prediction: any) => ({
            expert_id: prediction.expertId,
            analysis: prediction.analysis,
            link: prediction.link,
            prediction: prediction.prediction,
          })),
        };
      });
  
      this.tipsTableService.addMatchesWithPredictions({ matches: formData }).subscribe({
        next: () => {
          alert('บันทึกข้อมูลสำเร็จ!');
          this.tipsForm.reset();
          this.matches.clear();
          this.addMatch();
        },
        error: (err) => {
          console.error('เกิดข้อผิดพลาด:', err);
          alert('บันทึกข้อมูลล้มเหลว');
        },
      });
    } else {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  }
  

  // trackBy สำหรับ ngFor เพื่อเพิ่มประสิทธิภาพ
  trackByIndex(index: number): any {
    return index;
  }
}
