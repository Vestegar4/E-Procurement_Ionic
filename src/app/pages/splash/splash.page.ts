import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent
  ]
})
export class SplashPage implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    setTimeout(() => {
      const hasPrivacyAgreement = localStorage.getItem('proculus_privacy_agreed') === 'true';

      if (this.authService.getToken()) {
        void this.router.navigate(['/dashboard']);
        return;
      }

      if (hasPrivacyAgreement) {
        void this.router.navigate(['/login']);
        return;
      }

      void this.router.navigate(['/welcome']);
    }, 2000);
  }

}
