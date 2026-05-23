import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
  imports: [CommonModule, IonApp, IonRouterOutlet, RouterModule],
})
export class AppComponent {
  constructor(private router: Router) {}

  showBottomNav() {
    return !['/splash', '/welcome', '/login', '/register', '/forgot-password'].some(path =>
      this.router.url.startsWith(path)
    );
  }

  isActiveSection(section: 'dashboard' | 'tender' | 'documents' | 'profile') {
    const url = this.router.url;

    if (section === 'dashboard') {
      return url.startsWith('/dashboard');
    }

    if (section === 'tender') {
      return url.startsWith('/tender-list') || url.startsWith('/tender-detail');
    }

    if (section === 'documents') {
      return url.startsWith('/documents');
    }

    return url.startsWith('/profile');
  }
}
