// src/app/admin/manage-teams/manage-teams.component.ts

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

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    this.loadTeams();
    this.loadLeagues();
  }

  // ฟังก์ชันดึงข้อมูลทีมทั้งหมด
  loadTeams(): void {
    this.teamService.getTeams().subscribe(data => {
      this.teams = data;
    });
  }

  // ฟังก์ชันดึงข้อมูลลีกทั้งหมด
  loadLeagues(): void {
    this.teamService.getLeagues().subscribe(data => {
      this.leagues = data;
    });
  }

  // ฟังก์ชันเพิ่มทีมใหม่
  addTeam(): void {
    if (this.newTeam.name && this.newTeam.leagueId) {
      const leagueId = Number(this.newTeam.leagueId); // แปลง leagueId เป็นตัวเลข
      this.teamService.createTeam(this.newTeam.name, leagueId, this.newTeam.logoFile || undefined).subscribe(() => {
        this.loadTeams();
        this.newTeam = { name: '', leagueId: '', logoFile: null };
      });
    } else {
      alert("กรุณาใส่ชื่อทีมและเลือกลีก");
    }
  }

  // ฟังก์ชันแก้ไขทีม
  editTeam(team: any): void {
    this.selectedTeam = { id: team.id, name: team.team_name, leagueId: team.league_id.toString(), logoFile: null };
  }

  // ฟังก์ชันอัปเดตข้อมูลทีม
  updateTeam(): void {
    if (this.selectedTeam && this.selectedTeam.name && this.selectedTeam.leagueId) {
      const leagueId = Number(this.selectedTeam.leagueId); // แปลง leagueId เป็นตัวเลข
      this.teamService.updateTeam(this.selectedTeam.id, this.selectedTeam.name, leagueId, this.selectedTeam.logoFile || undefined).subscribe(() => {
        this.loadTeams();
        this.selectedTeam = null;
      });
    } else {
      alert("กรุณาเลือกทีมที่ต้องการอัปเดต");
    }
  }

  // ฟังก์ชันลบทีม
  deleteTeam(teamId: number): void {
    if (confirm("คุณแน่ใจว่าต้องการลบทีมนี้หรือไม่?")) {
      this.teamService.deleteTeam(teamId).subscribe(() => {
        this.loadTeams();
      });
    }
  }

  // ฟังก์ชันจัดการไฟล์รูปภาพที่อัปโหลด
  onFileSelected(event: any, type: string): void {
    const file: File = event.target.files[0];
    if (file) {
      if (type === 'new') {
        this.newTeam.logoFile = file;
      } else if (type === 'edit' && this.selectedTeam) {
        this.selectedTeam.logoFile = file;
      }
    }
  }
}
