import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { SelectedTableService } from 'src/app/core/service/api/selected-table.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-selected-table',
  templateUrl: './selected-table.component.html',
  styleUrls: ['./selected-table.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class SelectedTableComponent implements OnInit {
  selectedForm: FormGroup;
  leagues: any[] = [];
  teams: any[] = [];
  experts: any[] = [];
  today: string = new Date().toISOString().split('T')[0];

  constructor(private fb: FormBuilder, private selectedTableService: SelectedTableService) {
    this.selectedForm = this.fb.group({
      date: [this.today, Validators.required],
      selectedItems: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.loadSelectedItemsByDate(this.today); // Load current date's data
  }

  onDateChange(event: any): void {
    const selectedDate = event.target.value;
    this.loadSelectedItemsByDate(selectedDate); // Load data for selected date
  }

  loadSelectedItemsByDate(date: string): void {
    const selectedItemsArray = this.selectedItems;
    selectedItemsArray.clear(); // Clear old data
    this.selectedTableService.getSelectedItemsByDate(date).subscribe({
      next: (items: any[]) => {
        items.forEach((item: any) => {
          selectedItemsArray.push(this.createSelectedItemGroup(item));
        });
      },
      error: (err: any) => {
        console.error('Error fetching items by date:', err);
      },
    });
  }

  loadInitialData(): void {
    this.selectedTableService.getLeagues().subscribe({
      next: (leagues) => (this.leagues = leagues),
      error: (err) => console.error('Error fetching leagues:', err),
    });

    this.selectedTableService.getTeams().subscribe({
      next: (teams) => (this.teams = teams),
      error: (err) => console.error('Error fetching teams:', err),
    });

    this.selectedTableService.getExperts().subscribe({
      next: (experts) => (this.experts = experts),
      error: (err) => console.error('Error fetching experts:', err),
    });
  }

  createSelectedItemGroup(item: any = {}): FormGroup {
    const expertId = item.expert_id || null;
    const selectedExpert = this.experts.find((e) => e.id === expertId);
    const imageUrl = selectedExpert
      ? `http://127.0.0.1:5000/${selectedExpert.image_url}`
      : 'https://via.placeholder.com/100';

    return this.fb.group({
      id: [item.id || null],
      league_id: [item.league_id || '', Validators.required],
      home_team_id: [item.home_team_id || '', Validators.required],
      away_team_id: [item.away_team_id || '', Validators.required],
      expert_id: [expertId, Validators.required],
      expert_image: [imageUrl],
      analysis_link: [item.analysis_link || '', Validators.required],
      result: [item.result || '', Validators.required],
    });
  }

  get selectedItems(): FormArray {
    return this.selectedForm.get('selectedItems') as FormArray;
  }

  addSelectedItem(): void {
    this.selectedItems.push(this.createSelectedItemGroup());
  }

  removeSelectedItem(index: number): void {
    const item = this.selectedItems.at(index).value;
    if (item.id) {
      this.selectedTableService.deleteSelectedItem(item.id).subscribe({
        next: () => {
          alert('Item deleted successfully');
          this.selectedItems.removeAt(index);
        },
        error: (err) => {
          console.error('Error deleting item:', err);
          alert('An error occurred while deleting');
        },
      });
    } else {
      this.selectedItems.removeAt(index);
    }
  }

  saveAll(): void {
    if (this.selectedForm.valid) {
      const formData: any[] = this.selectedItems.value;

      if (formData.length === 0) {
        alert('ไม่มีข้อมูลให้บันทึก');
        return;
      }

      const saveRequests = formData.map((item: any) =>
        this.selectedTableService.saveSelectedItem(item)
      );

      forkJoin(saveRequests).subscribe({
        next: () => {
          alert('บันทึกข้อมูลทั้งหมดสำเร็จ');
          this.loadSelectedItemsByDate(this.selectedForm.get('date')?.value); // Reload data
        },
        error: (err) => {
          console.error('เกิดข้อผิดพลาดขณะบันทึก:', err);
          alert('เกิดข้อผิดพลาดขณะบันทึกข้อมูล');
        },
      });
    } else {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  }

  updateExpertImage(index: number): void {
    const selectedItem = this.selectedItems.at(index);
    const expertId = selectedItem.get('expert_id')?.value;

    if (expertId) {
      const selectedExpert = this.experts.find((e) => e.id === expertId);
      const imageUrl = selectedExpert
        ? `http://127.0.0.1:5000/${selectedExpert.image_url}`
        : 'https://via.placeholder.com/100';

      selectedItem.patchValue({ expert_image: imageUrl }, { emitEvent: false });
    } else {
      selectedItem.patchValue({ expert_image: 'https://via.placeholder.com/100' }, { emitEvent: false });
    }
  }

  getExpertImage(expertId: number | null): string {
    const expert = this.experts.find((e) => e.id === expertId);
    return expert ? `http://127.0.0.1:5000/${expert.image_url}` : 'https://via.placeholder.com/100';
  }
}
