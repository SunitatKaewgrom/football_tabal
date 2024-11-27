import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngFor
import { TeamService } from 'src/app/core/service/api/team.service'; // Import TeamService
import { TipsTableService } from 'src/app/core/service/api/tips-table.service'; // If needed for other API calls

@Component({
  selector: 'app-table1',
  standalone: true,
  templateUrl: './table1.component.html',
  styleUrls: ['./table1.component.css'],
  imports: [CommonModule] // Correctly include CommonModule here
})
export class Table1Component implements OnInit {
  matches: any[] = []; // Array to store match data
  teams: any[] = []; // Array to store team data

  constructor(
    private tipsTableService: TipsTableService,  // If needed
    private teamService: TeamService  // TeamService to fetch team data
  ) {}

  ngOnInit(): void {
    this.loadMatches(); // Fetch match data when component initializes
    this.loadTeams(); // Fetch teams data when component initializes
  }

  // Load matches data
  loadMatches(): void {
    this.tipsTableService.getMatches().subscribe({
      next: (response) => {
        console.log('Matches data:', response.data);
        this.matches = response.data || [];
      },
      error: (err) => {
        console.error('Error fetching matches:', err);
      }
    });
  }

  // Load teams data from teamService
  loadTeams(): void {
    this.teamService.getTeams().subscribe({
      next: (response) => {
        console.log('Teams data:', response);  // ตรวจสอบข้อมูลที่ได้รับจาก API
        if (response && response.data) {
          this.teams = response.data;
          console.log('Loaded teams:', this.teams);  // แสดงทีมที่โหลดมา
        } else {
          console.error('No team data received');
        }
      },
      error: (err) => {
        console.error('Error fetching teams:', err);
      }
    });
  }

  getTeamName(teamName: string): string {
    return teamName || 'ไม่พบข้อมูล';
  }

  // Get team logo URL using the team_id
  getTeamImage(teamId: number): string {
    console.log('Looking for team with ID:', teamId);  // ตรวจสอบ ID ที่กำลังมองหา
    const team = this.teams.find(t => t.id === teamId); // หา team ที่ตรงกับ ID
    if (team) {
      console.log(`Team ID: ${teamId}, Logo URL: ${team.logo_url}`);  // แสดงข้อมูล logo_url
      return `http://127.0.0.1:5000/${team.logo_url}`; // ส่ง URL ของโลโก้
    }
    console.log(`Team ID: ${teamId}, Logo URL not found`); // ถ้าไม่พบโลโก้
    return 'https://via.placeholder.com/50'; // ใช้ placeholder ถ้าไม่พบข้อมูล
  }

  formatDate(date: string, time: string): string {
    const formattedDate = new Date(date);
    return `${formattedDate.toLocaleDateString()} ${time}`;
  }
}
