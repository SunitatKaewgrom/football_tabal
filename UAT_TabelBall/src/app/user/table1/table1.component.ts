import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TeamService } from 'src/app/core/service/api/team.service';
import { TipsTableService } from 'src/app/core/service/api/tips-table.service';
import { HeaderMessageService } from 'src/app/core/service/api/header-message.service';
import { ExpertService } from 'src/app/core/service/api/experts.service';

interface Prediction {
  expert_id: number;
  prediction: string;
  status: 'WIN' | 'LOSE' | 'DRAW';
}

@Component({
  selector: 'app-table1',
  standalone: true,
  templateUrl: './table1.component.html',
  styleUrls: ['./table1.component.css'],
  imports: [CommonModule, HttpClientModule],
})
export class Table1Component implements OnInit {
  matches: any[] = [];
  teams: any[] = [];
  experts: any[] = [];
  headerMessage: any = null;

  constructor(
    private headerMessageService: HeaderMessageService,
    private teamService: TeamService,
    private tipsTableService: TipsTableService,
    private expertService: ExpertService
  ) {}

  ngOnInit(): void {
    this.loadHeaderMessage();
    this.loadTeams();
    this.loadMatches();
    this.loadExperts();
  }

  // โหลดข้อความ Header Message
  loadHeaderMessage(): void {
    this.headerMessageService.getMessages().subscribe({
      next: (response) => {
        this.headerMessage = response || null;
      },
      error: (error) => {
        console.error('Error fetching header messages:', error);
      },
    });
  }

  // โหลดข้อมูลทีม
  loadTeams(): void {
    this.teamService.getTeams().subscribe({
      next: (response) => {
        this.teams = response || [];
      },
      error: (error) => {
        console.error('Error fetching teams:', error);
      },
    });
  }

  // โหลดข้อมูลการแข่งขัน
  loadMatches(): void {
    this.tipsTableService.getMatches().subscribe({
      next: (response) => {
        this.matches = response?.data || [];
        this.matches.forEach((match) => {
          match.predictions = match.predictions || [];
        });
      },
      error: (error) => {
        console.error('Error fetching matches:', error);
      },
    });
  }

  // โหลดข้อมูลเซียน
  loadExperts(): void {
    this.expertService.getExperts().subscribe({
      next: (response: any) => {
        this.experts = response.map((expert: any) => ({
          ...expert,
          image_url: expert.image_url
            ? `${expert.image_url}`
            : 'https://via.placeholder.com/50',
        }));
        console.log('Experts loaded:', this.experts);
      },
      error: (error: any) => {
        console.error('Error fetching experts:', error);
      },
    });
  }

  // ดึงชื่อทีมจาก teamId
  getTeamName(teamId: number): string {
    const team = this.teams.find((t) => t.id === teamId);
    return team ? team.team_name : 'ไม่พบข้อมูล';
  }

  // ดึง URL โลโก้ทีมจาก teamId
  getTeamImage(teamId: number): string {
    const team = this.teams.find((t) => t.id === teamId);
    return team && team.logo_url
      ? `http://127.0.0.1:5000/${team.logo_url}`
      : 'https://via.placeholder.com/50';
  }

  // ฟอร์แมตวันที่และเวลา
  formatDate(date: string, time: string): string {
    const formattedDate = new Date(date);
    return `${formattedDate.toLocaleDateString()} ${time}`;
  }

  // ดึงข้อมูลการทำนายผลการแข่งขันจาก matchId และ expertId
  getPrediction(matchId: number, expertId: number): Prediction | null {
    const match = this.matches.find((m: any) => m.id === matchId);
    return match?.predictions?.find((p: Prediction) => p.expert_id === expertId) || null;
  }
}
