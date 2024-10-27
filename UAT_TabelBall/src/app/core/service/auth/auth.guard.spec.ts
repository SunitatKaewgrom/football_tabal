// src/app/auth.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authGuard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should allow activation if the user is logged in', () => {
    // ตั้งค่าให้ isLoggedIn ส่งค่า true
    authService.isLoggedIn.and.returnValue(true);
    
    expect(authGuard.canActivate()).toBe(true);
  });

  it('should navigate to login if the user is not logged in', () => {
    // ตั้งค่าให้ isLoggedIn ส่งค่า false
    authService.isLoggedIn.and.returnValue(false);

    authGuard.canActivate();

    // ตรวจสอบว่า router.navigate ถูกเรียกด้วยเส้นทาง '/login'
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
