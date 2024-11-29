import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamService } from 'src/app/core/service/api/team.service';
import { TipsTableService } from 'src/app/core/service/api/tips-table.service';

@Component({
  selector: 'app-table1',
  standalone: true,
  templateUrl: './table1.component.html',
  styleUrls: ['./table1.component.css'],
  imports: [CommonModule],
})
export class Table1Component implements OnInit {
  matches: any[] = []; // ข้อมูลการแข่งขัน
  teams: any[] = []; // ข้อมูลทีมทั้งหมด
  teamsMap: Map<number, any> = new Map(); // Map สำหรับแมป teamId กับข้อมูลทีม

  constructor(
    private tipsTableService: TipsTableService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  // โหลดข้อมูลทั้งหมด (ทีมและการแข่งขัน)
  async loadAllData(): Promise<void> {
    try {
      await this.loadTeams(); // โหลดข้อมูลทีม
      this.loadMatches(); // โหลดข้อมูลการแข่งขัน
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  // โหลดข้อมูลทีม
  async loadTeams(): Promise<void> {
    try {
      const response = await this.teamService.getTeams().toPromise();
      console.log('Raw response from API:', response);

      if (response) {
        this.teams = response; // ตั้งค่า teams
        this.teams.forEach((team) => {
          this.teamsMap.set(team.id, team); // เติมข้อมูล Map
          console.log(`Mapped Team ID: ${team.id}, Name: ${team.team_name}, Logo: ${team.logo_url}`);
        });
        console.log('Teams loaded and mapped:', this.teamsMap);
      } else {
        console.error('Teams data is undefined or empty.');
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  }

  // โหลดข้อมูลการแข่งขัน
  loadMatches(): void {
    this.tipsTableService.getMatches().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.matches = response.data; // ตั้งค่าการแข่งขัน
          console.log('Matches data received:', this.matches);
        } else {
          console.error('Matches data is undefined or empty.');
        }
      },
      error: (error) => {
        console.error('Error fetching matches:', error);
      },
    });
  }

  // ดึงชื่อทีมจาก teamId
  getTeamName(teamId: number): string {
    const team = this.teamsMap.get(teamId);
    if (team) {
      console.log(`Found team name for ID ${teamId}: ${team.team_name}`);
      return team.team_name;
    } else {
      console.warn(`No team found for ID: ${teamId}`);
      return 'ไม่พบข้อมูล';
    }
  }

  // ดึง URL โลโก้ทีมจาก teamId
  getTeamImage(teamId: number): string {
    const team = this.teamsMap.get(teamId);
    if (team && team.logo_url) {
      console.log(`Found Team ID: ${teamId}, Logo URL: ${team.logo_url}`);
      return `http://127.0.0.1:5000/${team.logo_url}`;
    } else {
      console.warn(`Logo not found for Team ID: ${teamId}`);
      return 'https://via.placeholder.com/50';
    }
  }

  // ฟอร์แมตวันที่และเวลา
  formatDate(date: string, time: string): string {
    const formattedDate = new Date(date);
    return `${formattedDate.toLocaleDateString()} ${time}`;
  }
}
