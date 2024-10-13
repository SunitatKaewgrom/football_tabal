import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

// Import Standalone Components สำหรับแต่ละตารางและ admin
import { AdminComponent } from './admin/admin.component';
import { Table1Component } from './user/table1/table1.component';
import { Table2Component } from './user/table2/table2.component';
import { Table3Component } from './user/table3/table3.component';

// กำหนดเส้นทาง (Routing)
export const routes: Routes = [
  { path: 'admin', component: AdminComponent },  // เส้นทางสำหรับ Admin Component
  { path: 'table1', component: Table1Component },  // เส้นทางสำหรับ ตาราง 1
  { path: 'table2', component: Table2Component },  // เส้นทางสำหรับ ตาราง 2
  { path: 'table3', component: Table3Component },  // เส้นทางสำหรับ ตาราง 3
  { path: '', redirectTo: '/table1', pathMatch: 'full' },  // เส้นทางเริ่มต้น redirect ไปที่ ตาราง 1
  { path: '**', redirectTo: '/table1' }  // จัดการเส้นทางที่ไม่ตรงกับใดๆ ด้วยการ redirect ไปที่ ตาราง 1
];
