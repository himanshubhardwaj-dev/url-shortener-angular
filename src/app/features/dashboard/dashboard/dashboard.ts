import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthState } from '../../../core/services/auth-state';
import { Url } from '../../../core/services/url';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  constructor(
    private authState: AuthState,
    private router: Router,
    private urlService: Url
  ) { }

  logout(): void {
    this.authState.logout();
    this.router.navigate(['/']);
  }
  testProtectedApi(): void {

    this.urlService.getAll().subscribe({

      next: (response) => {
        console.log('Protected API response:', response);
      },

      error: (error) => {
        console.error('Protected API failed:', error);
      }

    });
  }
}