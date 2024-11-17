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
    this.tipsTableService.getAllData().subscribe((data) => {
      this.teams = data.teams;
      this.leagues = data.leagues;
      this.experts = data.experts;
      this.refreshMatches();
      this.dataLoaded = true;
      this.cdr.markForCheck();
    });
  }

  refreshMatches(): void {
    this.tipsTableService.getTop5Matches().subscribe((response: any) => {
      this.matches.clear();
      response.data.forEach((match: any) => {
        const matchGroup = this.createMatchGroup(match);
        this.matches.push(matchGroup);
      });
      this.cdr.markForCheck();
    });
  }

  get matches(): FormArray {
    return this.tipsForm.get('matches') as FormArray;
  }

  createMatchGroup(matchData: any = {}): FormGroup {
    return this.fb.group({
      id: [matchData.match_id || null],
      matchStatus: [matchData.match_status || 'not_started', Validators.required],
      league: [matchData.league_id || '', Validators.required],
      homeTeam: [matchData.home_team_id || '', Validators.required],
      date: [matchData.date || '', Validators.required],
      odds: [matchData.odds || '', Validators.required],
      homeScore: [matchData.home_score || 0, Validators.required],
      awayTeam: [matchData.away_team_id || '', Validators.required],
      time: [matchData.time || '', Validators.required],
      teamAdvantage: [matchData.team_advantage || '', Validators.required],
      awayScore: [matchData.away_score || 0, Validators.required],
      expertPredictions: this.fb.array(
        (matchData.predictions || []).map((prediction: any) => this.createExpertPredictionGroup(prediction))
      ),
    });
  }

  addMatch(): void {
    if (this.matches.length >= 5) {
      const matchId = this.matches.at(0).get('id')?.value;
      if (matchId) {
        this.tipsTableService.deleteMatch(matchId).subscribe(() => {
          this.matches.removeAt(0);
          this.cdr.markForCheck();
        });
      } else {
        this.matches.removeAt(0);
        this.cdr.markForCheck();
      }
    }
    this.matches.push(this.createMatchGroup());
    this.cdr.markForCheck();
  }

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

  updateMatch(index: number): void {
    const matchId = this.matches.at(index).get('id')?.value;
    const matchData = this.matches.at(index).value;
    this.tipsTableService.updateMatch(matchId, matchData).subscribe({
      next: () => {
        alert('อัปเดตข้อมูลสำเร็จ!');
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาดในการอัปเดต:', err);
        alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
      },
    });
  }

  addExpertPrediction(matchIndex: number): void {
    const expertPredictions = this.getExpertPredictions(matchIndex);
    expertPredictions.push(this.createExpertPredictionGroup());
    this.cdr.markForCheck();
  }

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

  updatePrediction(matchIndex: number, predictionIndex: number): void {
    const predictionId = this.getExpertPredictions(matchIndex).at(predictionIndex).get('id')?.value;
    const predictionData = this.getExpertPredictions(matchIndex).at(predictionIndex).value;
    this.tipsTableService.updatePrediction(predictionId, predictionData).subscribe({
      next: () => {
        alert('อัปเดตข้อมูลเซียนบอลสำเร็จ!');
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาดในการอัปเดตเซียนบอล:', err);
        alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
      },
    });
  }

  createExpertPredictionGroup(predictionData: any = {}): FormGroup {
    return this.fb.group({
      id: [predictionData.id || null],
      expertId: [predictionData.expert_id || '', Validators.required],
      analysis: [predictionData.analysis || '', Validators.required],
      link: [predictionData.link || '', Validators.required],
      prediction: [predictionData.prediction || 'win', Validators.required],
    });
  }

  getExpertPredictions(matchIndex: number): FormArray {
    return this.matches.at(matchIndex).get('expertPredictions') as FormArray;
  }

  getTeamImage(teamId: string): string | null {
    const team = this.teams.find((t) => t.id.toString() === teamId);
    return team ? `http://127.0.0.1:5000/${team.logo_url}` : null;
  }

  getLeagueImage(leagueId: string): string | null {
    const league = this.leagues.find((l) => l.id.toString() === leagueId);
    return league ? `http://127.0.0.1:5000/${league.logo_url}` : null;
  }

  getExpertImage(expertId: string): string | null {
    const expert = this.experts.find((e) => e.id.toString() === expertId);
    return expert ? `http://127.0.0.1:5000/${expert.image_url}` : null;
  }

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
          this.refreshMatches();
          alert('บันทึกข้อมูลสำเร็จ!');
        },
        error: (err) => {
          console.error('เกิดข้อผิดพลาดในการบันทึก:', err);
          alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        },
      });
    }
  }

  trackByIndex(index: number): any {
    return index;
  }
}
