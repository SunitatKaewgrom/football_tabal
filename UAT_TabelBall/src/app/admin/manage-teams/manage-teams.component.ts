import { Component, OnInit } from '@angular/core';
import { TeamService } from 'src/app/core/service/api/team.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-teams',
  templateUrl: './manage-teams.component.html',
  styleUrls: ['./manage-teams.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ManageTeamsComponent implements OnInit {
  teams: any[] = [];
  leagues: any[] = [];
  newTeam = { name: '', leagueId: '', logoFile: null as File | null };
  selectedTeam: { id: number; name: string; leagueId: string; logoFile: File | null } | null = null;
  logoFileName: string | null = null;
  selectedLogoFileName: string | null = null;
  showEditPopup: boolean = false;

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    this.loadTeams();
    this.loadLeagues();
  }

  // โหลดข้อมูลทีมทั้งหมด
  loadTeams(): void {
    this.teamService.getTeams().subscribe({
      next: (data) => {
        this.teams = [...data];
      },
      error: (error) => {
        console.error('Error loading teams:', error);
      }
    });
  }

  // โหลดข้อมูลลีกทั้งหมด
  loadLeagues(): void {
    this.teamService.getLeagues().subscribe({
      next: (data) => {
        this.leagues = [...data];
      },
      error: (error) => {
        console.error('Error loading leagues:', error);
      }
    });
  }

  // เพิ่มทีมใหม่
  addTeam(): void {
    if (this.newTeam.name && this.newTeam.leagueId) {
      const leagueId = Number(this.newTeam.leagueId);
      this.teamService.createTeam(this.newTeam.name, leagueId, this.newTeam.logoFile || undefined).subscribe({
        next: () => {
          this.loadTeams(); // อัปเดตข้อมูลหลังเพิ่มทีมสำเร็จ
          this.newTeam = { name: '', leagueId: '', logoFile: null };
          this.logoFileName = null;
        },
        error: (error) => {
          console.error('Error creating team:', error);
        }
      });
    } else {
      alert("กรุณาใส่ชื่อทีมและเลือกลีก");
    }
  }

  // แก้ไขทีม
  editTeam(team: any): void {
    this.selectedTeam = { 
      id: team.id, 
      name: team.team_name, 
      leagueId: team.league_id ? team.league_id.toString() : '', 
      logoFile: null 
    };
    this.selectedLogoFileName = null;
    this.showEditPopup = true; // แสดง Popup แก้ไขข้อมูลทีม
  }

  // อัปเดตข้อมูลทีม
  updateTeam(): void {
    if (this.selectedTeam && this.selectedTeam.name && this.selectedTeam.leagueId) {
      const leagueId = Number(this.selectedTeam.leagueId);
      this.teamService.updateTeam(this.selectedTeam.id, this.selectedTeam.name, leagueId, this.selectedTeam.logoFile || undefined).subscribe({
        next: () => {
          this.loadTeams(); // อัปเดตข้อมูลหลังแก้ไขสำเร็จ
          this.closeEditPopup(); // ปิด Popup หลังการอัปเดต
        },
        error: (error) => {
          console.error('Error updating team:', error);
        }
      });
    } else {
      alert("กรุณาเลือกทีมที่ต้องการอัปเดต");
    }
  }

  // ลบทีม
  deleteTeam(teamId: number): void {
    if (confirm("คุณแน่ใจว่าต้องการลบทีมนี้หรือไม่?")) {
      this.teamService.deleteTeam(teamId).subscribe({
        next: () => {
          this.loadTeams(); // อัปเดตข้อมูลหลังจากลบสำเร็จ
        },
        error: (error) => {
          console.error('Error deleting team:', error);
        }
      });
    }
  }

  // ฟังก์ชันจัดการไฟล์รูปภาพที่อัปโหลด
  onFileSelected(event: any, type: string): void {
    const file: File = event.target.files[0];
    if (file) {
      if (type === 'new') {
        this.newTeam.logoFile = file;
        this.logoFileName = file.name;
      } else if (type === 'edit' && this.selectedTeam) {
        this.selectedTeam.logoFile = file;
        this.selectedLogoFileName = file.name;
      }
    }
  }

  // ปิด Popup และรีเซ็ตค่า
  closeEditPopup(): void {
    this.selectedTeam = null;
    this.selectedLogoFileName = null;
    this.showEditPopup = false;
  }
}
