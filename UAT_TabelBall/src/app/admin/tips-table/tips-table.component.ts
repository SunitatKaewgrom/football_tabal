import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // ใช้สำหรับคำสั่งพื้นฐานของ Angular
import { TipsTableService } from 'src/app/core/service/api/tips-table.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AbstractControl } from '@angular/forms';

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
    console.log('ngOnInit called');
    this.loadAllData(); // ตรวจสอบว่ามีการเรียก refreshMatches ที่นี่หรือไม่
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
      next: (response) => {
        console.log('API Response:', response);
  
        const matchesArray = this.matches;
        matchesArray.clear(); // ล้างข้อมูลเดิมออกก่อน
  
        response.data.forEach((match: any) => {
          console.log('Creating Match Group for:', match);
  
          // ระบุประเภทที่ชัดเจนสำหรับ uniquePredictions
          const uniquePredictions: PredictionData[] = [];
          const seenIds = new Set<number>();
  
          // กรอง Prediction ที่ซ้ำออก
          match.predictions.forEach((prediction: PredictionData) => {
            if (prediction.id !== null && !seenIds.has(prediction.id)) {
              seenIds.add(prediction.id);
              uniquePredictions.push(prediction);
              console.log('Unique Prediction Added:', prediction);
            }
          });
  
          // เพิ่ม Match พร้อม Prediction
          match.predictions = uniquePredictions;
          matchesArray.push(this.createMatchGroup(match));
        });
  
        console.log('Matches loaded with predictions:', matchesArray.value);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading matches:', err);
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
      expertPredictions: this.fb.array(
        (match.predictions || []).map((prediction: any) => this.createExpertPredictionGroup(prediction))
      ),
    });
  }
  
  
 // ปรับปรุงการสร้าง Expert Prediction Group
createExpertPredictionGroup(prediction: any = {}): FormGroup {
  console.log('Creating Expert Prediction Group for:', prediction);
  return this.fb.group({
    id: [prediction.id || null],
    expert_id: [prediction.expert_id || '', Validators.required],
    analysis: [prediction.analysis || '', Validators.required],
    link: [prediction.link || '', Validators.required],
    prediction: [prediction.prediction || 'win', Validators.required],
    isNew: [prediction.isNew ?? !prediction.id], // ระบุว่าเป็น Prediction ใหม่หรือไม่
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
    const expertPredictions = this.getExpertPredictions(matchIndex);
    const prediction = expertPredictions.at(predictionIndex).value;
  
    if (prediction.id) {
      // หากมี prediction_id ให้ลบออกจากฐานข้อมูล
      this.tipsTableService.deletePrediction(prediction.id).subscribe({
        next: () => {
          console.log(`Prediction with id ${prediction.id} deleted successfully.`);
          expertPredictions.removeAt(predictionIndex); // ลบออกจาก UI
          alert('เซียนถูกลบออกจากฐานข้อมูลสำเร็จ!');
          this.cdr.markForCheck(); // บังคับให้ UI อัปเดต
        },
        error: (err) => {
          console.error('Error deleting prediction:', err);
          alert('เกิดข้อผิดพลาดในการลบเซียน');
        },
      });
    } else {
      // หากไม่มี prediction_id แสดงว่าเซียนยังไม่ได้ถูกบันทึกในฐานข้อมูล
      expertPredictions.removeAt(predictionIndex); // ลบออกจาก UI อย่างเดียว
      alert('เซียนถูกลบออกจากรายการ (ยังไม่ได้บันทึกในฐานข้อมูล)');
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
  
  
  
  
  
  
  private addNewMatch(match: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.tipsTableService.addMatchesWithPredictions({ matches: [match] }).subscribe({
        next: (response) => {
          console.log('Match added successfully:', response);
          resolve(response); // สำเร็จ
        },
        error: (err) => {
          console.error('Error adding match:', err);
          reject(err); // เกิดข้อผิดพลาด
        },
      });
    });
  }
  
  private updateExistingMatch(match: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.tipsTableService.updateMatch(match.matchDetails.id, match.matchDetails).subscribe({
        next: () => {
          console.log('Match updated successfully');
          this.processPredictions(match.matchDetails.id, match.newPredictions, match.updatedPredictions)
            .then(resolve) // สำเร็จ
            .catch(reject); // เกิดข้อผิดพลาด
        },
        error: (err) => {
          console.error(`Error updating match with ID ${match.matchDetails.id}:`, err);
          reject(err); // เกิดข้อผิดพลาด
        },
      });
    });
  }
  
  
  
  private processPredictions(matchId: number, newPredictions: PredictionData[], updatedPredictions: PredictionData[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const addPromises = newPredictions.map((prediction) => {
        const formattedPrediction = { ...prediction, expert_id: prediction.expert_id };
        console.log('Adding new prediction:', formattedPrediction);
        return this.tipsTableService.addPrediction(matchId, formattedPrediction).toPromise();
      });
  
      const updatePromises = updatedPredictions.map((prediction) => {
        console.log('Updating prediction:', prediction);
        return this.tipsTableService.updatePrediction(Number(prediction.id), prediction).toPromise();
      });
  
      Promise.all([...addPromises, ...updatePromises])
        .then((results) => {
          console.log('All predictions processed successfully:', results);
          resolve(results); // สำเร็จ
        })
        .catch((error) => {
          console.error('Error processing predictions:', error);
          reject(error); // เกิดข้อผิดพลาด
        });
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
  
  refreshMatches(): void {
    this.tipsTableService.getMatches().subscribe({
      next: (response) => {
        const matchesArray = this.matches;
        matchesArray.clear();
  
        response.data.forEach((match: any) => {
          const uniquePredictions: PredictionData[] = []; // กำหนดชนิดข้อมูลเป็น PredictionData[]
          const seenIds = new Set<number>();
  
          match.predictions.forEach((prediction: PredictionData) => {
            if (!seenIds.has(prediction.id!)) {
              uniquePredictions.push(prediction);
              seenIds.add(prediction.id!);
            } else {
              console.warn('Duplicate Prediction Removed:', prediction);
            }
          });
  
          match.predictions = uniquePredictions; // ใช้ข้อมูล Prediction ที่กรองแล้ว
          matchesArray.push(this.createMatchGroup(match));
        });
  
        console.log('Matches after refresh:', matchesArray.value);
        this.cdr.detectChanges(); // อัปเดต UI
      },
      error: (err) => {
        console.error('Error refreshing matches:', err);
      },
    });
  }
  
  
  
  // ฟังก์ชันช่วยติดตามการเปลี่ยนแปลงใน *ngFor
  trackByIndex(index: number): any {
    return index;
  }

  trackById(index: number, control: AbstractControl<any, any>): any {
    // ใช้ ID จาก FormControl หรือ Index หากไม่มี ID
    return control.get('id')?.value || index;
  }
  
  
}
