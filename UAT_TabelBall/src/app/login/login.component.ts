import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/service/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule,CommonModule]  // เพิ่ม FormsModule ใน imports
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.username, this.password).subscribe(
      (response) => {
        localStorage.setItem('token', response.token);
        this.router.navigate(['/admin']);
      },
      (error) => {
        this.errorMessage = 'Login failed. Please check your credentials and try again.';
      }
    );
  }
}
