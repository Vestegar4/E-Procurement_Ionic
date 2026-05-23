import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonButton
} from '@ionic/angular/standalone';

import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonButton
  ]
})
export class WelcomePage {

  constructor(private router: Router) {}

  startApp() {
    localStorage.setItem('has_seen_welcome', 'true');
    this.router.navigate(['/login']);
  }
  
}