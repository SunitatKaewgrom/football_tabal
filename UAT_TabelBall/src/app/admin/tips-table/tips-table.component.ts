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
    this.loadAllData(); // โหลดข้อมูลทั้งหมดเมื่อคอมโพเนนต์เริ่มต้น
  }
  
  // โหลดข้อมูลทีม ลีก และเซียนบอลทั้งหมด
  loadAllData(): void {
    this.tipsTableService.getAllData().subscribe({
      next: (data) => {
        this.teams = data.teams;
        this.leagues = data.leagues;
        this.experts = data.experts;
  
        console.log('Teams:', this.teams);
        console.log('Experts:', this.experts);
  
        this.loadMatches(); // โหลดข้อมูล Matches หลังจาก Teams และ Experts พร้อม
        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading data:', err);
      },
    });
  }
  
  
  // อัปเดตรูปภาพทีมและเซียน
  updateImages(): void {
    // แสดงภาพทีม
    this.teams.forEach(team => {
      const teamImage = this.getTeamImage(team.id);
      console.log('Team Image URL:', teamImage); // ตรวจสอบว่า URL ถูกต้องหรือไม่
    });
  
    // แสดงภาพเซียน
    this.experts.forEach(expert => {
      const expertImage = this.getExpertImage(expert.id);
      console.log('Expert Image URL:', expertImage); // ตรวจสอบว่า URL ถูกต้องหรือไม่
    });
  }


  
  private getAllPredictions(): PredictionData[] {
    const allPredictions: PredictionData[] = [];
    this.matches.controls.forEach((matchGroup: any) => {
      const expertPredictions = matchGroup.get('expertPredictions')?.value || [];
      allPredictions.push(...expertPredictions);
    });
    return allPredictions;
  }
  
  originalPredictions: PredictionData[] = [];

  // โหลด Matches และ Predictions จาก API
  loadMatches(): void {
    this.tipsTableService.getMatches().subscribe({
      next: (response) => {
        const matchesArray = this.matches;
        matchesArray.clear();
  
        this.originalPredictions = response.data.flatMap((match: any) => match.predictions || []);
        console.log('Loaded Original Predictions:', this.originalPredictions);
  
        response.data.forEach((match: any) => {
          matchesArray.push(this.createMatchGroup(match));
        });
  
        // อัปเดตรูปภาพหลังจาก Matches ถูกโหลด
        this.updateImages();
  
        console.log('Updated Matches Array:', matchesArray.value);
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
    isNew: [prediction.isNew ?? !prediction.id], // ตรวจสอบ isNew
  });
}

  
  
  
  

// ฟังก์ชันที่ใช้เพิ่ม Match ใหม่
addMatch(): void {
  const matchesArray = this.matches;

  // สร้าง FormGroup ใหม่ที่ไม่เชื่อมโยงกับข้อมูลเดิม
  const newMatchGroup = this.createMatchGroup({
    id: null,  // กำหนดค่าเริ่มต้นเป็น null
    matchStatus: 'not_started',  // ค่าเริ่มต้นสำหรับ match ใหม่
    league: '',
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    odds: '',
    homeScore: null,
    awayScore: null,
    teamAdvantage: '',
    predictions: [],  // ให้ค่าผลทำนายเริ่มต้นเป็นอาร์เรย์ว่าง
    expertPredictions: [] // กำหนดให้ expertPredictions เป็นอาร์เรย์ว่างใน match ใหม่
  });

  // ลบข้อมูลเดิมใน matchesArray ก่อน
  matchesArray.clear();

  // รีเซ็ตค่า FormGroup ใหม่ที่ตำแหน่งแรก (index 0)
  matchesArray.insert(0, newMatchGroup);

  // รีเฟรชการแสดงผล
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
  
          // รีเฟรชข้อมูลใน UI ทันที
          this.refreshMatch(matchIndex); // ฟังก์ชันที่ใช้รีเฟรช match นี้
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
  
  // ฟังก์ชันรีเฟรช match ที่ทำการลบ prediction
  refreshMatch(matchIndex: number): void {
    const matchFormGroup = this.matches.at(matchIndex); // เข้าถึง FormGroup ของ match
    const updatedMatch = matchFormGroup.value; // ข้อมูลล่าสุดของ match
  
    // รีเฟรชข้อมูลใน FormArray (form group ที่เกี่ยวข้อง)
    this.matches.setValue([...this.matches.value]); // หรือใช้ methods ที่คุณใช้ในการอัปเดต
    this.cdr.detectChanges(); // บังคับให้ UI อัปเดต
  }
  

  
    
 // ฟังก์ชันช่วยโหลดรูปภาพของทีม
 getTeamImage(teamId: string | number): string | null {
  console.log('getTeamImage called with teamId:', teamId);
  const team = this.teams.find((t) => t.id.toString() === teamId.toString());
  return team ? `http://127.0.0.1:5000/${team.logo_url}` : null;
}

  // ฟังก์ชันช่วยโหลดรูปภาพของลีก
  getLeagueImage(leagueId: string): string | null {
    const league = this.leagues.find((l) => l.id.toString() === leagueId);
    return league ? `http://127.0.0.1:5000/${league.logo_url}` : null;
  }

  // ฟังก์ชันช่วยโหลดรูปภาพของเซียนบอล
  getExpertImage(expertId: string | number): string | null {
    console.log('getExpertImage called with expertId:', expertId);
    const expert = this.experts.find((e) => e.id.toString() === expertId.toString());
    return expert ? `http://127.0.0.1:5000/${expert.image_url}` : null;
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

   // ฟังก์ชันบันทึก Matches และ Predictions
   onSubmit(): void {
    if (this.tipsForm.valid) {
      console.log('Form Submitted:', this.tipsForm.value);
  
      const matchesData = this.matches.value.map((match: any) => {
        const { expertPredictions, ...matchDetails } = match;
  
        const newPredictions = expertPredictions.filter((prediction: any) => prediction.isNew);
        const updatedPredictions = expertPredictions.filter((prediction: any) =>
          prediction.id && this.isPredictionUpdated(prediction)
        );
  
        return { matchDetails, newPredictions, updatedPredictions };
      });
  
      matchesData.forEach((match: any) => {
        if (!match.matchDetails.id) {
          this.addNewMatch(match).then(() => this.refreshMatches());
        } else {
          this.updateExistingMatch(match);
        }
      });
  
      // เพิ่มการรีเฟรช Matches
      this.refreshMatches();
    } else {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  }
  
  
  
  
  private updateExistingMatch(match: any): void {
    console.log('Updating existing match:', match.matchDetails);
    this.tipsTableService.updateMatch(match.matchDetails.id, match.matchDetails).subscribe({
      next: () => {
        console.log(`Match with ID ${match.matchDetails.id} updated successfully`);
        this.processPredictions(match.matchDetails.id, match.newPredictions, match.updatedPredictions);
      },
      error: (err) => {
        console.error(`Error updating match with ID ${match.matchDetails.id}:`, err);
      },
    });
  }
  
  
  private processPredictions(
    matchId: number,
    newPredictions: PredictionData[],
    updatedPredictions: PredictionData[]
  ): void {
    console.log('Processing Predictions for Match ID:', matchId);
    console.log('New Predictions:', newPredictions);
    console.log('Updated Predictions:', updatedPredictions);
  
    const addPromises = newPredictions.map((prediction) => {
      console.log('Adding Prediction:', prediction);
      return this.tipsTableService.addPrediction(matchId, prediction).toPromise();
    });
  
    const updatePromises = updatedPredictions.map((prediction) => {
      console.log('Updating Prediction:', prediction);
      return this.tipsTableService.updatePrediction(prediction.id!, prediction).toPromise();
    });
  
    Promise.all([...addPromises, ...updatePromises])
      .then((results) => {
        console.log('All predictions processed successfully:', results);
        this.refreshMatches();
      })
      .catch((error) => {
        console.error('Error processing predictions:', error);
      });
  }
  

  private isPredictionUpdated(prediction: PredictionData): boolean {
    const originalPrediction = this.originalPredictions.find((p: PredictionData) => p.id === prediction.id);
  
    if (!originalPrediction) {
      console.warn(`Original prediction not found for ID: ${prediction.id}`);
      return false;
    }
  
    const isExpertIdChanged = originalPrediction.expert_id !== prediction.expert_id;
    const isAnalysisChanged = originalPrediction.analysis !== prediction.analysis;
    const isLinkChanged = originalPrediction.link !== prediction.link;
    const isPredictionChanged = originalPrediction.prediction !== prediction.prediction;
  
    console.log('Expert ID Changed:', isExpertIdChanged, { original: originalPrediction.expert_id, current: prediction.expert_id });
    console.log('Analysis Changed:', isAnalysisChanged, { original: originalPrediction.analysis, current: prediction.analysis });
    console.log('Link Changed:', isLinkChanged, { original: originalPrediction.link, current: prediction.link });
    console.log('Prediction Changed:', isPredictionChanged, { original: originalPrediction.prediction, current: prediction.prediction });
  
    return isExpertIdChanged || isAnalysisChanged || isLinkChanged || isPredictionChanged;
  }
  
  
  
  private getOriginalPrediction(predictionId: number): PredictionData | null {
    const allPredictions = this.matches.value.flatMap((match: any) =>
      match.expertPredictions || []
    );
  
    const originalPrediction = allPredictions.find((p: any) => p.id === predictionId) || null;
  
    console.log(`Fetched Original Prediction for ID ${predictionId}:`, originalPrediction);
    return originalPrediction;
  }
  
  
  
  
  private refreshMatches(): void {
    console.log('Refreshing Matches...');
    this.tipsTableService.getMatches().subscribe({
      next: (response) => {
        console.log('API Response:', response);
  
        const matchesArray = this.matches;
        matchesArray.clear(); // ลบข้อมูลเดิม
  
        response.data.forEach((match: any) => {
          console.log('Processing Match:', match);
          matchesArray.push(this.createMatchGroup(match)); // เพิ่ม Matches ใหม่
        });
  
        console.log('Updated Matches Array:', matchesArray.value);
        this.cdr.detectChanges(); // บังคับให้ Angular อัปเดต UI
      },
      error: (err) => {
        console.error('Error refreshing matches:', err);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      },
    });
  }
  
  
  
  


  trackById(index: number, control: AbstractControl<any, any>): any {
    // ใช้ ID จาก FormControl หรือ Index หากไม่มี ID
    return control.get('id')?.value || index;
  }
  
  trackByPredictionId(index: number, item: any): any {
    return item.id; // ใช้ `id` เป็นตัวระบุ
  }
  
}
