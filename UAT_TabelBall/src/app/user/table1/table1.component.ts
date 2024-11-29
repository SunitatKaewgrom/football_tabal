import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TeamService } from 'src/app/core/service/api/team.service';
import { TipsTableService } from 'src/app/core/service/api/tips-table.service';
import { HeaderMessageService } from 'src/app/core/service/api/header-message.service';

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
  headerMessage: any = null; // เก็บข้อความ Header Message จาก API

  constructor(
    private headerMessageService: HeaderMessageService,
    private teamService: TeamService,
    private tipsTableService: TipsTableService
  ) {}

  ngOnInit(): void {
    this.loadHeaderMessage(); // โหลดข้อความ Header Message
    this.loadTeams();         // โหลดข้อมูลทีม
    this.loadMatches();       // โหลดข้อมูลการแข่งขัน
  }

  // โหลดข้อความ Header Message
  loadHeaderMessage(): void {
    this.headerMessageService.getMessages().subscribe({
      next: (response) => {
        console.log('Header messages API response:', response);
        if (response && response.description) {
          this.headerMessage = response; // ใช้ response ทั้ง object
          console.log('Header message loaded:', this.headerMessage);
        } else {
          console.warn('No header messages found.');
          this.headerMessage = null;
        }
      },
      error: (error) => {
        console.error('Error fetching header messages:', error);
        this.headerMessage = null;
      },
    });
  }
  
  

  // โหลดข้อมูลทีม
  loadTeams(): void {
    this.teamService.getTeams().subscribe({
      next: (response) => {
        this.teams = response || [];
        console.log('Teams loaded:', this.teams);
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
        console.log('Matches loaded:', this.matches);
      },
      error: (error) => {
        console.error('Error fetching matches:', error);
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
    return team && team.logo_url ? `http://127.0.0.1:5000/${team.logo_url}` : 'https://via.placeholder.com/50';
  }

  // ฟอร์แมตวันที่และเวลา
  formatDate(date: string, time: string): string {
    const formattedDate = new Date(date);
    return `${formattedDate.toLocaleDateString()} ${time}`;
  }
}
