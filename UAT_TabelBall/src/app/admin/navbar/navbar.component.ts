import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';  // Import RouterModule สำหรับใช้งาน router-outlet
import { CommonModule } from '@angular/common'; // ต้องเพิ่มเพื่อนำ directive พื้นฐานของ Angular มาใช้

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isMenuOpen = false; // State to track whether the mobile menu is open or not

  // Function to toggle menu state
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    console.log('Hamburger button clicked! Menu state:', this.isMenuOpen); // Debugging log
  }
}
