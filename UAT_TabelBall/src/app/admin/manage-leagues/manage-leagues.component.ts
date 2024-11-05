import { Component, OnInit } from '@angular/core';
import { LeagueService } from 'src/app/core/service/api/league.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-leagues',
  templateUrl: './manage-leagues.component.html',
  styleUrls: ['./manage-leagues.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ManageLeaguesComponent implements OnInit {
  leagues: any[] = [];
  newLeague = { name: '', logoFile: null as File | null };
  selectedLeague: { id: number; name: string; logoFile: File | null } | null = null;
  showEditPopup = false;

  constructor(private leagueService: LeagueService) {}

  ngOnInit(): void {
    this.loadLeagues();
  }

  loadLeagues(): void {
    this.leagueService.getLeagues().subscribe({
      next: (data) => {
        this.leagues = data;
      },
      error: (error) => {
        console.error('Error loading leagues:', error);
      }
    });
  }

  addLeague(): void {
    if (this.newLeague.name && this.newLeague.logoFile) {
      this.leagueService.createLeague(this.newLeague.name, this.newLeague.logoFile).subscribe(() => {
        this.loadLeagues();
        this.newLeague = { name: '', logoFile: null };
      });
    } else {
      alert("กรุณาใส่ชื่อและเลือกรูปภาพสำหรับลีก");
    }
  }

  editLeague(league: any): void {
    this.selectedLeague = { id: league.id, name: league.name, logoFile: null };
    this.showEditPopup = true;
  }

  updateLeague(): void {
    if (this.selectedLeague?.name) {
      const logoFile = this.selectedLeague.logoFile || undefined;
      this.leagueService.updateLeague(this.selectedLeague.id, this.selectedLeague.name, logoFile).subscribe(() => {
        this.loadLeagues();
        this.closeEditPopup();
      });
    } else {
      alert("กรุณาเลือกลีกที่ต้องการอัปเดต");
    }
  }

  deleteLeague(leagueId: number): void {
    if (confirm("คุณแน่ใจว่าต้องการลบลีกนี้หรือไม่?")) {
      this.leagueService.deleteLeague(leagueId).subscribe(() => {
        this.loadLeagues();
      });
    }
  }

  onFileSelected(event: any, leagueType: string): void {
    const file: File = event.target.files[0];
    if (file) {
      if (leagueType === 'new') {
        this.newLeague.logoFile = file;
      } else if (leagueType === 'edit' && this.selectedLeague) {
        this.selectedLeague.logoFile = file;
      }
    }
  }

  closeEditPopup(): void {
    this.selectedLeague = null;
    this.showEditPopup = false;
  }
}
