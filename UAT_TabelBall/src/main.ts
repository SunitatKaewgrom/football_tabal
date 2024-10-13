import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

// บูตแอปพลิเคชันด้วย Routing ที่กำหนดไว้
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes)  // ให้ใช้ระบบ Routing ที่เราได้ตั้งไว้
  ]
});
