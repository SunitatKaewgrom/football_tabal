import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';  // Import Router สำหรับการนำทาง
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service'; // Import AuthService สำหรับฟังก์ชัน Logout


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']  // แก้จาก styleUrl เป็น styleUrls (ใช้ array)
})
export class NavbarComponent {
  isMenuOpen = false; // State to track whether the mobile menu is open or not

  constructor(private authService: AuthService, private router: Router) {}

  // Function to toggle menu state
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Function to logout and navigate to login page
  onLogout() {
    this.authService.logout();  // ลบ token และออกจากระบบ
    this.router.navigate(['/login']);  // นำทางไปหน้า login หลังจาก logout
  }
}
