import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // ใช้สำหรับคำสั่งพื้นฐานของ Angular
import { TipsTableService } from 'src/app/core/service/api/tips-table.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// ประกาศ Interface ก่อน @Component
interface MatchData {
  matchDetails: {
    id: number | null;
    matchStatus: string;
    league: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    time: string;
    odds: string;
    homeScore: number;
    awayScore: number;
    teamAdvantage: string;
  };
  predictions: PredictionData[];
}

interface PredictionData {
  id: number | null;
  expert_id: number;
  analysis: string;
  link: string;
  prediction: string;
  isNew?: boolean; // เพิ่มฟิลด์ isNew (Optional)
}



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
    private cdr: ChangeDetectorRef,
    private http: HttpClient
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
      isNew: [prediction.isNew ?? !prediction.id], // isNew เป็น true ถ้า id ไม่มีค่า
    });
  }
  
  

  addMatch(): void {
    console.log('Adding a new match'); // ตรวจสอบว่าฟังก์ชันทำงานหรือไม่
    const matchesArray = this.matches;
  
    // เพิ่ม Match ใหม่
    matchesArray.push(
      this.createMatchGroup({
        predictions: [], // Predictions ว่างสำหรับ Match ใหม่
      })
    );
  
    console.log('Matches after addition:', matchesArray.value); // ตรวจสอบว่า Match ถูกเพิ่มใน FormArray หรือไม่
  
    // อัปเดตการแสดงผล
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
    console.log(`Adding a new prediction to match at index ${matchIndex}`); // ตรวจสอบการเพิ่ม Prediction
    const expertPredictions = this.getExpertPredictions(matchIndex);
  
    expertPredictions.push(this.createExpertPredictionGroup());
    console.log('Expert Predictions after addition:', expertPredictions.value); // ตรวจสอบค่าหลังการเพิ่ม
    this.cdr.markForCheck();
  }

  // ลบ Expert Prediction
  removeExpertPrediction(matchIndex: number, predictionIndex: number): void {
    const predictionId = this.getExpertPredictions(matchIndex).at(predictionIndex).get('id')?.value;
    console.log(`Removing prediction at index ${predictionIndex} in match ${matchIndex} with id: ${predictionId}`); // Log ข้อมูลก่อนลบ
  
    if (predictionId) {
      this.tipsTableService.deletePrediction(predictionId).subscribe({
        next: () => {
          console.log(`Prediction with id ${predictionId} deleted successfully`);
          this.getExpertPredictions(matchIndex).removeAt(predictionIndex);
          this.cdr.markForCheck();
        },
        error: (err) => console.error(`Error deleting prediction with id ${predictionId}:`, err),
      });
    } else {
      console.log('Prediction does not exist in the database, removing locally');
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
      console.log('Submitting form:', this.tipsForm.value);
  
      const matchesData = this.matches.value.map((match: any) => {
        const { expertPredictions, ...matchDetails } = match;
  
        return {
          matchDetails,
          predictions: expertPredictions.map((prediction: any) => ({
            id: prediction.id ?? undefined,
            expert_id: prediction.expertId,
            analysis: prediction.analysis,
            link: prediction.link,
            prediction: prediction.prediction,
            isNew: prediction.isNew || false, // กำหนด isNew
          })),
        };
      });
  
      matchesData.forEach((match: MatchData) => {
        if (match.matchDetails.id) {
          this.tipsTableService.updateMatch(match.matchDetails.id, match.matchDetails).subscribe({
            next: () => {
              console.log(`Match with id ${match.matchDetails.id} updated successfully`);
              match.predictions.forEach((prediction: PredictionData) => {
                if (prediction.isNew) {
                  // เพิ่ม Predictions ใหม่
                  this.tipsTableService.addPrediction(match.matchDetails.id!, prediction).subscribe({
                    next: () => console.log('Prediction added successfully'),
                    error: (err) => console.error('Error adding prediction:', err),
                  });
                } else if (this.isPredictionUpdated(prediction)) {
                  // อัปเดต Predictions ที่เปลี่ยนแปลง
                  this.tipsTableService.updatePrediction(Number(prediction.id), prediction).subscribe({
                    next: () => console.log(`Prediction with id ${prediction.id} updated successfully`),
                    error: (err) => console.error(`Error updating prediction with id ${prediction.id}:`, err),
                  });
                }
              });
            },
            error: (err) => console.error(`Error updating match with id ${match.matchDetails.id}:`, err),
          });
        } else {
          this.tipsTableService.addMatchesWithPredictions({ matches: [match] }).subscribe({
            next: () => console.log('Match and predictions added successfully'),
            error: (err) => console.error('Error adding match and predictions:', err),
          });
        }
      });
  
      alert('บันทึกข้อมูลสำเร็จ!');
      this.refreshMatches();
    } else {
      console.error('Form is invalid:', this.tipsForm);
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  }
  
  
  private isPredictionUpdated(prediction: PredictionData): boolean {
    // ใช้ค่า Prediction เดิมที่โหลดมาจาก API เปรียบเทียบกับ Prediction ปัจจุบัน
    const originalPrediction = this.getOriginalPrediction(prediction.id!);
    if (!originalPrediction) {
      return false; // ไม่มีข้อมูลเดิมให้เปรียบเทียบ
    }
  
    return (
      originalPrediction.expert_id !== prediction.expert_id ||
      originalPrediction.analysis !== prediction.analysis ||
      originalPrediction.link !== prediction.link ||
      originalPrediction.prediction !== prediction.prediction
    );
  }
  
  // ฟังก์ชันช่วยดึง Prediction เดิมจาก API หรือข้อมูลในฟอร์ม
  private getOriginalPrediction(predictionId: number): PredictionData | null {
    // ตัวอย่างการดึง Prediction เดิม (ควรเปลี่ยนเป็นการดึงข้อมูลจาก state หรือ cache ของคุณ)
    const allPredictions = this.matches.value.flatMap((match: any) =>
      match.expertPredictions || []
    );
  
    return allPredictions.find((p: any) => p.id === predictionId) || null;
  }
  
  
  refreshMatches(): void {
  this.tipsTableService.getMatches().subscribe((response: any) => {
    this.matches.clear();
    response.data.forEach((match: any) => {
      const matchGroup = this.createMatchGroup(match);
      this.matches.push(matchGroup);
    });
    this.cdr.markForCheck();
  });
}

  

  // ฟังก์ชันช่วยติดตามการเปลี่ยนแปลงใน *ngFor
  trackByIndex(index: number): any {
    return index;
  }
}
