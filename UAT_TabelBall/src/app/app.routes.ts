import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

// Import Standalone Components สำหรับแต่ละตารางและ admin
import { AdminComponent } from './admin/admin.component';
import { UserComponent } from './user/user.component';
import { NavbarComponent } from './admin/navbar/navbar.component';
import { HeaderMessageComponent } from './admin/header-message/header-message.component';
import { TipsTableComponent } from './admin/tips-table/tips-table.component';
import { SelectedTableComponent } from './admin/selected-table/selected-table.component';
import { CommunityExpertsComponent } from './admin/community-experts/community-experts.component';
import { ManageExpertsComponent } from './admin/manage-experts/manage-experts.component';
import { ManageAdminsComponent } from './admin/manage-admins/manage-admins.component';
import { ManageLeaguesComponent } from './admin/manage-leagues/manage-leagues.component';
import { ManageTeamsComponent } from './admin/manage-teams/manage-teams.component';
import { Table1Component } from './user/table1/table1.component';
import { Table2Component } from './user/table2/table2.component';
import { Table3Component } from './user/table3/table3.component';
import { LoginComponent } from './login/login.component';  // Import Login Component
import { AuthGuard } from './core/service/auth/auth.guard';  // Import AuthGuard

// กำหนดเส้นทาง (Routing)
export const routes: Routes = [
  // เส้นทางสำหรับหน้า login
  { path: 'login', component: LoginComponent },  // เส้นทางสำหรับหน้า login

  // เส้นทางสำหรับ Admin พร้อม AuthGuard
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],  // ใช้ AuthGuard สำหรับหน้า Admin
    children: [
      { path: 'header-message', component: HeaderMessageComponent },  // เส้นทางสำหรับ Header message
      { path: 'tips-table', component: TipsTableComponent },  // เส้นทางสำหรับ ตารางทีเด็ดบอลวันนี้
      { path: 'selected-table', component: SelectedTableComponent },  // เส้นทางสำหรับ ตารางบอลเด็ดวันนี้
      { path: 'community-experts', component: CommunityExpertsComponent },  // เส้นทางสำหรับ เซียนบอลทางบ้าน
      { path: 'manage-experts', component: ManageExpertsComponent },  // เส้นทางสำหรับ จัดการเซียนบอล
      { path: 'manage-admins', component: ManageAdminsComponent },  // เส้นทางสำหรับ จัดการแอดมิน
      { path: 'manage-leagues', component: ManageLeaguesComponent },  // เส้นทางสำหรับ จัดการลีค
      { path: 'manage-teams', component: ManageTeamsComponent },  // เส้นทางสำหรับ จัดการทีม
      { path: '', redirectTo: 'header-message', pathMatch: 'full' }  // เส้นทางเริ่มต้นของ Admin (redirect ไปที่ header-message)
    ]
  },

  // เส้นทางสำหรับ User
  { path: 'table1', component: Table1Component },  // เส้นทางสำหรับ ตาราง 1
  { path: 'table2', component: Table2Component },  // เส้นทางสำหรับ ตาราง 2
  { path: 'table3', component: Table3Component },  // เส้นทางสำหรับ ตาราง 3

  // เส้นทางเริ่มต้น (Redirect ไปที่ Table1)
  { path: '', redirectTo: '/table1', pathMatch: 'full' },  // เส้นทางเริ่มต้น redirect ไปที่ ตาราง 1

  // จัดการเส้นทางที่ไม่ตรงกับใดๆ (Redirect ไปที่ Table1)
  { path: '**', redirectTo: '/table1' }  // จัดการเส้นทางที่ไม่ตรงกับใดๆ ด้วยการ redirect ไปที่ ตาราง 1
];
