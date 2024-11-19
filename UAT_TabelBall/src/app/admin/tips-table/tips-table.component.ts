import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // ใช้สำหรับคำสั่งพื้นฐานของ Angular
import { TipsTableService } from 'src/app/core/service/api/tips-table.service';

@Component({
  selector: 'app-tips-table',
  templateUrl: './tips-table.component.html',
  styleUrls: ['./tips-table.component.css'],
  standalone: true,
  imports: [
    CommonModule, // สำหรับคำสั่งทั่วไปเช่น *ngFor, *ngIf
    ReactiveFormsModule // สำหรับฟอร์มแบบ Reactive
  ],
})
export class TipsTableComponent implements OnInit {
  tipsForm: FormGroup;
  teams: any[] = [];
  leagues: any[] = [];
  experts: any[] = [];
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
    this.loadAllData();
  }

  // โหลดข้อมูลทีม ลีก และเซียนบอลทั้งหมด
  loadAllData(): void {
    this.tipsTableService.getAllData().subscribe({
      next: (data) => {
        this.teams = data.teams;
        this.leagues = data.leagues;
        this.experts = data.experts;
        this.loadMatches();
        this.dataLoaded = true;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', err);
      },
    });
  }

  // โหลด Matches และ Predictions จาก API
  loadMatches(): void {
    this.tipsTableService.getMatches().subscribe((response: any) => {
      const matchesArray = this.tipsForm.get('matches') as FormArray;
      matchesArray.clear();
      response.data.forEach((match: any) => {
        matchesArray.push(this.createMatchGroup(match));
      });
    });
  }

  // Getter สำหรับ Matches
  get matches(): FormArray {
    return this.tipsForm.get('matches') as FormArray;
  }

  // Getter สำหรับ Predictions
  getExpertPredictions(matchIndex: number): FormArray {
    return this.matches.at(matchIndex).get('expertPredictions') as FormArray;
  }

  // สร้าง Match Group
  createMatchGroup(match: any = {}): FormGroup {
    return this.fb.group({
      id: [match.match_id || null],
      matchStatus: [match.match_status || 'not_started', Validators.required],
      league: [match.league_id || '', Validators.required],
      homeTeam: [match.home_team_id || '', Validators.required],
      awayTeam: [match.away_team_id || '', Validators.required],
      date: [match.date || '', Validators.required],
      time: [match.time || '', Validators.required],
      odds: [match.odds || '', Validators.required],
      homeScore: [match.home_score || 0, Validators.required],
      awayScore: [match.away_score || 0, Validators.required],
      teamAdvantage: [match.team_advantage || '', Validators.required],
      expertPredictions: this.fb.array(
        (match.predictions || []).map((prediction: any) =>
          this.createExpertPredictionGroup(prediction)
        )
      ),
    });
  }

  // สร้าง Expert Prediction Group
  createExpertPredictionGroup(prediction: any = {}): FormGroup {
    return this.fb.group({
      id: [prediction.id || null],
      expertId: [prediction.expert_id || '', Validators.required],
      analysis: [prediction.analysis || '', Validators.required],
      link: [prediction.link || '', Validators.required],
      prediction: [prediction.prediction || 'win', Validators.required],
    });
  }

  // เพิ่ม Match ใหม่
  addMatch(): void {
    const matchesArray = this.tipsForm.get('matches') as FormArray;
    if (matchesArray.length >= 5) {
      const firstMatchId = matchesArray.at(0).get('id')?.value;
      if (firstMatchId) {
        this.tipsTableService.deleteMatch(firstMatchId).subscribe(() => {
          matchesArray.removeAt(0);
          this.cdr.markForCheck();
        });
      } else {
        matchesArray.removeAt(0);
        this.cdr.markForCheck();
      }
    }
    matchesArray.push(this.createMatchGroup());
    this.cdr.markForCheck();
  }

  // ลบ Match
  removeMatch(index: number): void {
    const matchId = this.matches.at(index).get('id')?.value;
    if (matchId) {
      this.tipsTableService.deleteMatch(matchId).subscribe(() => {
        this.matches.removeAt(index);
        this.cdr.markForCheck();
      });
    } else {
      this.matches.removeAt(index);
      this.cdr.markForCheck();
    }
  }

  // เพิ่ม Expert Prediction
  addExpertPrediction(matchIndex: number): void {
    const expertPredictions = this.getExpertPredictions(matchIndex);
    expertPredictions.push(this.createExpertPredictionGroup());
    this.cdr.markForCheck();
  }

  // ลบ Expert Prediction
  removeExpertPrediction(matchIndex: number, predictionIndex: number): void {
    const predictionId = this.getExpertPredictions(matchIndex).at(predictionIndex).get('id')?.value;
    if (predictionId) {
      this.tipsTableService.deletePrediction(predictionId).subscribe(() => {
        this.getExpertPredictions(matchIndex).removeAt(predictionIndex);
        this.cdr.markForCheck();
      });
    } else {
      this.getExpertPredictions(matchIndex).removeAt(predictionIndex);
      this.cdr.markForCheck();
    }
  }

  // ฟังก์ชันช่วยโหลดรูปภาพของทีม
  getTeamImage(teamId: string): string | null {
    const team = this.teams.find((t) => t.id.toString() === teamId);
    return team ? `http://127.0.0.1:5000/${team.logo_url}` : null;
  }

  // ฟังก์ชันช่วยโหลดรูปภาพของลีก
  getLeagueImage(leagueId: string): string | null {
    const league = this.leagues.find((l) => l.id.toString() === leagueId);
    return league ? `http://127.0.0.1:5000/${league.logo_url}` : null;
  }

  // ฟังก์ชันช่วยโหลดรูปภาพของเซียนบอล
  getExpertImage(expertId: string): string | null {
    const expert = this.experts.find((e) => e.id.toString() === expertId);
    return expert ? `http://127.0.0.1:5000/${expert.image_url}` : null;
  }

  // ฟังก์ชันบันทึก Matches และ Predictions
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
        next: () => {
          this.loadMatches();
          alert('บันทึกข้อมูลสำเร็จ!');
        },
        error: (err) => {
          console.error('เกิดข้อผิดพลาดในการบันทึก:', err);
          alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        },
      });
    }
  }

  // ฟังก์ชันช่วยติดตามการเปลี่ยนแปลงใน *ngFor
  trackByIndex(index: number): any {
    return index;
  }
}
