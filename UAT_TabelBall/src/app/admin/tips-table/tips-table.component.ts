import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TipsTableService } from 'src/app/core/service/api/tips-table.service';

@Component({
  selector: 'app-tips-table',
  standalone: true,
  templateUrl: './tips-table.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush, // ใช้ OnPush เพื่อเพิ่มประสิทธิภาพการอัปเดต UI
})
export class TipsTableComponent implements OnInit {
  tipsForm: FormGroup; // ฟอร์มหลักสำหรับจัดการข้อมูล
  teams: any[] = []; // ข้อมูลทีม
  leagues: any[] = []; // ข้อมูลลีก
  experts: any[] = []; // ข้อมูลเซียนบอล
  dataLoaded: boolean = false; // ตรวจสอบสถานะว่าข้อมูลโหลดสำเร็จหรือไม่

  constructor(
    private fb: FormBuilder, // FormBuilder สำหรับสร้างและจัดการฟอร์ม
    private tipsTableService: TipsTableService, // Service สำหรับดึงข้อมูลและบันทึกข้อมูล
    private cdr: ChangeDetectorRef // สำหรับอัปเดต UI
  ) {
    // กำหนดโครงสร้างฟอร์ม
    this.tipsForm = this.fb.group({
      matches: this.fb.array([]), // Array สำหรับจัดการคู่บอล
    });
  }

  ngOnInit(): void {
    // โหลดข้อมูลทีม ลีก และเซียนบอล
    this.tipsTableService.getAllData().subscribe((data) => {
      this.teams = data.teams;
      this.leagues = data.leagues;
      this.experts = data.experts;
      this.refreshMatches(); // ดึงข้อมูลคู่บอล 5 คู่ล่าสุด
      this.dataLoaded = true; // ตั้งค่าให้โหลดสำเร็จ
      this.cdr.markForCheck(); // รีเฟรช UI
    });
  }

  // ดึงข้อมูลคู่บอล 5 คู่ล่าสุด และแสดงในฟอร์ม
  refreshMatches(): void {
    this.tipsTableService.getTop5Matches().subscribe((response: any) => {
      this.matches.clear(); // ล้างข้อมูลคู่บอลในฟอร์ม
      response.data.forEach((match: any) => {
        const matchGroup = this.createMatchGroup();
        matchGroup.patchValue({
          matchStatus: match.match_status,
          league: match.league_id,
          homeTeam: match.home_team_id,
          awayTeam: match.away_team_id,
          date: match.date,
          time: match.time,
          odds: match.odds,
          homeScore: match.home_score,
          awayScore: match.away_score,
          teamAdvantage: match.team_advantage,
        });

        const expertPredictionsArray = matchGroup.get('expertPredictions') as FormArray;
        match.predictions.forEach((prediction: any) => {
          const predictionGroup = this.createExpertPredictionGroup();
          predictionGroup.patchValue({
            expertId: prediction.expert_id,
            analysis: prediction.analysis,
            link: prediction.link,
            prediction: prediction.prediction,
          });
          expertPredictionsArray.push(predictionGroup);
        });

        this.matches.push(matchGroup);
      });
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
      matchStatus: ['not_started', Validators.required], // สถานะการแข่งขัน
      league: ['', Validators.required], // ลีก
      homeTeam: ['', Validators.required], // ทีมเหย้า
      date: ['', Validators.required], // วันที่
      odds: ['', Validators.required], // ราคารอง
      homeScore: [0, Validators.required], // คะแนนทีมเหย้า
      awayTeam: ['', Validators.required], // ทีมเยือน
      time: ['', Validators.required], // เวลา
      teamAdvantage: ['', Validators.required], // ทีมที่ได้เปรียบ
      awayScore: [0, Validators.required], // คะแนนทีมเยือน
      expertPredictions: this.fb.array([]), // การทายผลของเซียนบอล
    });
  }

  // เพิ่ม match
  addMatch(): void {
    if (this.matches.length >= 5) {
      this.matches.removeAt(0); // ลบคู่บอลเก่าที่สุด
    }
    this.matches.push(this.createMatchGroup()); // เพิ่มคู่บอลใหม่
    this.cdr.markForCheck();
  }

  // ลบ match
  removeMatch(index: number): void {
    this.matches.removeAt(index); // ลบคู่บอลตามลำดับที่เลือก
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
      link: ['', Validators.required], // ลิงก์การวิเคราะห์
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

  // บันทึกข้อมูล matches และ predictions
  onSubmit(): void {
    if (this.tipsForm.valid) {
      const matchesData = this.matches.value.map((match: any) => {
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

      this.tipsTableService.addMatchesWithPredictions({ matches: matchesData }).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.refreshMatches(); // อัปเดต matches หลังบันทึกสำเร็จ
            alert('บันทึกข้อมูลสำเร็จ!');
          }
        },
        error: (err) => {
          console.error('เกิดข้อผิดพลาดในการบันทึก:', err);
          alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        },
      });
    }
  }

  // trackBy สำหรับ ngFor
  trackByIndex(index: number): any {
    return index;
  }
}
