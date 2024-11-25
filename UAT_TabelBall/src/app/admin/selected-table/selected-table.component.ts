import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { SelectedTableService } from 'src/app/core/service/api/selected-table.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

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
    this.selectedTableService.getLeagues().subscribe((leagues) => (this.leagues = leagues));
    this.selectedTableService.getTeams().subscribe((teams) => (this.teams = teams));
    this.selectedTableService.getExperts().subscribe((experts) => {
      this.experts = experts;
      this.loadSelectedItems(); // Load selected items after experts are fetched
    });
  }

  loadSelectedItems(): void {
    const selectedItemsArray = this.selectedItems;
    this.selectedTableService.getSelectedItems().subscribe((items) => {
      items.forEach((item: any) => {
        const group = this.createSelectedItemGroup(item);
        selectedItemsArray.push(group);
      });
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
      expert_image: [imageUrl], // Image field
      analysis_link: [item.analysis_link || '', Validators.required],
      result: [item.result || '', Validators.required],
    });
  }

  get selectedItems(): FormArray {
    return this.selectedForm.get('selectedItems') as FormArray;
  }

  addSelectedItem(): void {
    const newItem = this.createSelectedItemGroup();
    this.selectedItems.push(newItem);
  }

  removeSelectedItem(index: number): void {
    this.selectedItems.removeAt(index);
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

  saveSelectedItem(index: number): void {
    const item = this.selectedItems.at(index).value;
    this.selectedTableService.saveSelectedItem(item).subscribe({
      next: (response) => {
        alert('Item saved successfully');
        this.selectedItems.at(index).patchValue({ id: response.id });
      },
      error: (err) => {
        console.error('Error saving item:', err);
        alert('Error occurred while saving');
      },
    });
  }
  

  saveAll(): void {
  if (this.selectedForm.valid) {
    const formData = this.selectedForm.value.selectedItems;
    this.selectedTableService.saveSelectedItem(formData).subscribe({
      next: () => {
        alert('All data saved successfully');
        this.loadSelectedItems(); // Reload data after saving
      },
      error: (err: any) => {
        console.error('Error saving data:', err);
        alert('An error occurred while saving data');
      },
    });
  } else {
    alert('Please fill in all required fields');
  }
}


  getExpertImage(expertId: number | null): string {
    const expert = this.experts.find((e) => e.id === expertId);
    return expert ? `http://127.0.0.1:5000/${expert.image_url}` : 'https://via.placeholder.com/100';
  }
}
