import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';  // Import NavbarComponent
import { RouterModule } from '@angular/router';  // Import RouterModule สำหรับใช้งาน router-outlet


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NavbarComponent,RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})


export class AdminComponent {

}
