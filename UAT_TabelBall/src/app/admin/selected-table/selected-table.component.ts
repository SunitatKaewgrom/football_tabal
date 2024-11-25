import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectedTableService } from 'src/app/core/service/api/selected-table.service';

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
      selectedItems: this.fb.array([]), // Initialize the FormArray
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    // Load leagues, teams, and experts from the API
    this.selectedTableService.getLeagues().subscribe((leagues) => (this.leagues = leagues));
    this.selectedTableService.getTeams().subscribe((teams) => (this.teams = teams));
    this.selectedTableService.getExperts().subscribe((experts) => (this.experts = experts));
    // Load selected items and populate the FormArray
    this.loadSelectedItems();
  }

  loadSelectedItems(): void {
    const selectedItemsArray = this.selectedItems;
    this.selectedTableService.getSelectedItems().subscribe((items) => {
      items.forEach((item: any) => {
        selectedItemsArray.push(this.createSelectedItemGroup(item));
      });
    });
  }

  createSelectedItemGroup(item: any = {}): FormGroup {
    return this.fb.group({
      id: [item.id || null],
      league_id: [item.league_id || '', Validators.required],
      home_team_id: [item.home_team_id || '', Validators.required],
      away_team_id: [item.away_team_id || '', Validators.required],
      expert_id: [item.expert_id || '', Validators.required],
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
    this.selectedItems.removeAt(index);
  }

  saveSelectedItem(index: number): void {
    const item = this.selectedItems.at(index).value;
    if (item.id) {
      this.selectedTableService.saveSelectedItem(item).subscribe(() => alert('Updated successfully'));
    } else {
      this.selectedTableService.saveSelectedItem(item).subscribe((savedItem) => {
        this.selectedItems.at(index).patchValue({ id: savedItem.id });
        alert('Saved successfully');
      });
    }
  }

  getExpertName(expertId: number): string {
    const expert = this.experts.find((e) => e.id === expertId);
    return expert ? expert.name : 'Unknown Expert';
  }

  getExpertImage(expertId: number | null): string {
    const expert = this.experts.find((e) => e.id === expertId);
    return expert ? `http://127.0.0.1:5000/${expert.image_url}` : 'https://via.placeholder.com/100';
  }
  saveAll(): void {
    if (this.selectedForm.valid) {
      const formData = this.selectedForm.value.selectedItems;
      this.selectedTableService.saveAllSelectedItems(formData).subscribe({
        next: () => {
          alert('บันทึกข้อมูลทั้งหมดสำเร็จ');
          this.loadSelectedItems(); // Reload the data after saving
        },
        error: (err) => {
          console.error('Error saving data:', err);
          alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        },
      });
    } else {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  }

  
  
}
