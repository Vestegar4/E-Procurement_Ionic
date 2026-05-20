import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit() {
  setTimeout(() => {
    const hasSeenWelcome = localStorage.getItem('has_seen_welcome');

    if (hasSeenWelcome) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/welcome']);
    }
  }, 2000);
}

}