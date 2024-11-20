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
    this.tipsTableService.getMatches().subscribe({
      next: (response: any) => {
        console.log('API Response:', response); // เพิ่มการแสดงข้อมูลเพื่อตรวจสอบโครงสร้างของข้อมูลที่ได้รับ
  
        if (response && response.data && Array.isArray(response.data)) {
          const matchesArray = this.matches;
          matchesArray.clear(); // เคลียร์ข้อมูลเก่า
  
          response.data.forEach((match: any) => {
            // ตรวจสอบว่า Predictions มาพร้อมกับ Match หรือไม่
            const matchGroup = this.createMatchGroup(match);
            if (Array.isArray(match.predictions)) {
              const predictionsArray = matchGroup.get('expertPredictions') as FormArray;
              match.predictions.forEach((prediction: any) => {
                predictionsArray.push(this.createExpertPredictionGroup(prediction));
              });
            }
            matchesArray.push(matchGroup);
          });
  
          console.log('Matches loaded with predictions:', matchesArray.value);
        } else {
          console.error('Invalid response format: Expected array in response.data', response);
          alert('ไม่สามารถโหลดข้อมูลได้');
        }
      },
      error: (err) => {
        console.error('Error fetching matches:', err);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      },
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
      homeScore: [match.home_score ?? null, Validators.required],
      awayScore: [match.away_score ?? null, Validators.required],
      teamAdvantage: [match.team_advantage || '', Validators.required],
      expertPredictions: this.fb.array([]), // ไม่มี Predictions เริ่มต้น
    });
  }
  
  

  // สร้าง Expert Prediction Group
  createExpertPredictionGroup(prediction: any = {}): FormGroup {
    return this.fb.group({
      id: [prediction.id || null], // ใช้ ID ถ้ามี หรือกำหนดเป็น null
      expert_id: [prediction.expert_id || '', Validators.required], // ID ของเซียน
      analysis: [prediction.analysis || '', Validators.required], // ข้อวิเคราะห์
      link: [prediction.link || '', Validators.required], // ลิงก์
      prediction: [prediction.prediction || 'win', Validators.required], // ผลลัพธ์
      isNew: [prediction.isNew ?? !prediction.id], // ระบุว่าคือ Prediction ใหม่
    });
  }
  
  
  

  addMatch(): void {
    const matchesArray = this.matches;
  
    // เพิ่ม Match ใหม่ที่ตำแหน่งแรก พร้อมข้อมูลเริ่มต้นที่ว่างเปล่า
    matchesArray.insert(
      0,
      this.createMatchGroup({
        match_id: null,
        match_status: 'not_started',
        league_id: '',
        home_team_id: '',
        away_team_id: '',
        date: '',
        time: '',
        odds: '',
        home_score: null,
        away_score: null,
        team_advantage: '',
        predictions: [],
      })
    );
  
    console.log('New empty Match added at the top:', matchesArray.value);
  
    // บังคับให้ Angular อัปเดต UI
    this.cdr.detectChanges();
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
  
    // เพิ่ม Prediction ใหม่ที่ว่างเปล่า
    expertPredictions.push(
      this.createExpertPredictionGroup({
        id: null, // Prediction ใหม่ยังไม่มี ID
        expert_id: '', // ต้องเลือกเซียน
        analysis: '',
        link: '',
        prediction: 'win', // ค่าเริ่มต้น
        isNew: true, // ระบุว่าเป็น Prediction ใหม่
      })
    );
  
    console.log('New expert prediction added:', expertPredictions.value);
  
    // บังคับให้ Angular อัปเดต UI
    this.cdr.detectChanges();
  }
  
  

  // ลบ Expert Prediction
  removeExpertPrediction(matchIndex: number, predictionIndex: number): void {
    const confirmDelete = confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเซียนบอลนี้?');
    if (!confirmDelete) {
      return; // หยุดการทำงานหากผู้ใช้กดยกเลิก
    }
  
    const expertPrediction = this.getExpertPredictions(matchIndex).at(predictionIndex);
    const predictionId = expertPrediction.get('id')?.value;
  
    if (predictionId) {
      // ลบในฐานข้อมูล
      this.tipsTableService.deletePrediction(predictionId).subscribe({
        next: () => {
          console.log(`Prediction with ID ${predictionId} deleted successfully`);
          this.getExpertPredictions(matchIndex).removeAt(predictionIndex); // ลบจาก UI
          alert('เซียนบอลถูกลบเรียบร้อยแล้ว');
        },
        error: (err) => {
          console.error(`Error deleting prediction with ID ${predictionId}:`, err);
          alert('เกิดข้อผิดพลาดในการลบเซียนบอล');
        },
      });
    } else {
      // ลบเฉพาะใน UI หากยังไม่ได้บันทึก
      this.getExpertPredictions(matchIndex).removeAt(predictionIndex);
      alert('เซียนบอลถูกลบออกจากรายการ (ยังไม่ได้บันทึกในฐานข้อมูล)');
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
      console.log('Form Submitted:', this.tipsForm.value);
  
      const matchesData = this.matches.value.map((match: any) => {
        const { expertPredictions, ...matchDetails } = match;
  
        return {
          matchDetails,
          newPredictions: expertPredictions.filter((prediction: any) => prediction.isNew),
          updatedPredictions: expertPredictions.filter((prediction: any) =>
            prediction.id && this.isPredictionUpdated(prediction)
          ),
        };
      });
  
      matchesData.forEach((match: any) => {
        if (!match.matchDetails.id) {
          this.addNewMatch(match);
        } else {
          this.updateExistingMatch(match);
        }
      });
    } else {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  }
  
  private addNewMatch(match: any): void {
    this.tipsTableService.addMatchesWithPredictions({ matches: [match] }).subscribe({
      next: (response) => {
        console.log('Match added successfully:', response);
        this.refreshMatches();
        alert('เพิ่มข้อมูลสำเร็จ!');
      },
      error: (err) => {
        console.error('Error adding match:', err);
        alert('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
      },
    });
  }
  
  private updateExistingMatch(match: any): void {
    this.tipsTableService.updateMatch(match.matchDetails.id, match.matchDetails).subscribe({
      next: () => {
        console.log('Match updated successfully');
        this.processPredictions(match.matchDetails.id, match.newPredictions, match.updatedPredictions);
      },
      error: (err) => {
        console.error(`Error updating match with ID ${match.matchDetails.id}:`, err);
        alert(`เกิดข้อผิดพลาดในการอัปเดต Match ID: ${match.matchDetails.id}`);
      },
    });
  }
  
  processPredictions(matchId: number, newPredictions: PredictionData[], updatedPredictions: PredictionData[]): void {
    const addPromises = newPredictions.map((prediction, index) =>
      this.tipsTableService.addPrediction(matchId, prediction).toPromise().then((response) => {
        console.log('Added prediction response:', response);
  
        // อัปเดต ID ใน FormArray
        const addedPrediction = response; // สมมติ API ส่ง { id: 123 } กลับมา
        newPredictions[index].id = addedPrediction.id;
        newPredictions[index].isNew = false;
      })
    );
  
    const updatePromises = updatedPredictions.map((prediction) =>
      this.tipsTableService.updatePrediction(Number(prediction.id), prediction).toPromise()
    );
  
    Promise.all([...addPromises, ...updatePromises])
      .then(() => {
        console.log('All predictions processed successfully');
        this.refreshMatches();
      })
      .catch((error) => {
        console.error('Error processing predictions:', error);
      });
  }
  
  
  private isPredictionUpdated(prediction: PredictionData): boolean {
    if (!prediction.id) {
      return false; // ถ้าไม่มี ID ให้ถือว่าเป็นข้อมูลใหม่
    }
  
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
  
  private getOriginalPrediction(predictionId: number): PredictionData | null {
    // ค้นหา Prediction เดิมจาก Matches ทั้งหมด
    const allPredictions = this.matches.value.flatMap((match: any) =>
      match.expertPredictions || []
    );
  
    return allPredictions.find((p: any) => p.id === predictionId) || null;
  }
  
  private refreshMatches(): void {
    this.tipsTableService.getMatches().subscribe({
      next: (response) => {
        console.log('API Response for Matches:', response); // ตรวจสอบโครงสร้างข้อมูล
  
        const matchesArray = this.matches;
        matchesArray.clear(); // ลบข้อมูลเดิม
  
        response.data.forEach((match: any) => {
          matchesArray.push(this.createMatchGroup(match)); // เพิ่ม Matches ใหม่
        });
        console.log('Matches refreshed:', matchesArray.value); // ตรวจสอบข้อมูลใน FormArray
        this.cdr.detectChanges(); // บังคับให้ Angular อัปเดต UI
      },
      error: (err) => {
        console.error('Error refreshing matches:', err);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      },
    });
  }
  

  // ฟังก์ชันช่วยติดตามการเปลี่ยนแปลงใน *ngFor
  trackByIndex(index: number): any {
    return index;
  }
}
