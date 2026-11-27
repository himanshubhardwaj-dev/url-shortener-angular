import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { AuthState } from '../../../core/services/auth-state';
import { ChangePasswordRequest, UpdateProfileRequest, UserProfile } from '../../../models/auth/user-profile.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  readonly profile = signal<UserProfile | null>(null);
  readonly isLoading = signal(true);
  readonly isSavingProfile = signal(false);
  readonly isChangingPassword = signal(false);
  readonly profileError = signal('');
  readonly profileSuccess = signal('');
  readonly passwordError = signal('');
  readonly passwordSuccess = signal('');

  firstName = '';
  lastName = '';
  email = '';
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private auth: Auth,
    private authState: AuthState,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.profileError.set('');

    this.auth.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.firstName = profile.firstName;
        this.lastName = profile.lastName;
        this.email = profile.email;
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load account profile:', error);
        this.profileError.set(this.getErrorMessage(error, 'Unable to load your account details.'));
        this.isLoading.set(false);
      }
    });
  }

  saveProfile(): void {
    const request: UpdateProfileRequest = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim()
    };

    if (!request.firstName || !request.lastName || !request.email) {
      this.profileError.set('First name, last name and email are required.');
      this.profileSuccess.set('');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
      this.profileError.set('Enter a valid email address.');
      this.profileSuccess.set('');
      return;
    }

    this.isSavingProfile.set(true);
    this.profileError.set('');
    this.profileSuccess.set('');

    this.auth.updateProfile(request).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.firstName = profile.firstName;
        this.lastName = profile.lastName;
        this.email = profile.email;
        this.authState.updateEmail(profile.email);
        this.profileSuccess.set('Your profile has been updated successfully.');
        this.isSavingProfile.set(false);
      },
      error: (error) => {
        console.error('Failed to update profile:', error);
        this.profileError.set(this.getErrorMessage(error, 'Unable to update your profile.'));
        this.isSavingProfile.set(false);
      }
    });
  }

  updatePassword(): void {
    this.passwordError.set('');
    this.passwordSuccess.set('');

    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      this.passwordError.set('Complete all password fields.');
      return;
    }

    if (this.newPassword.length < 8) {
      this.passwordError.set('Your new password must contain at least 8 characters.');
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordError.set('The new password and confirmation do not match.');
      return;
    }

    const request: ChangePasswordRequest = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmNewPassword: this.confirmNewPassword
    };

    this.isChangingPassword.set(true);
    this.auth.changePassword(request).subscribe({
      next: () => {
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
        this.passwordSuccess.set('Your password has been changed successfully.');
        this.isChangingPassword.set(false);
      },
      error: (error) => {
        console.error('Failed to change password:', error);
        this.passwordError.set(this.getErrorMessage(error, 'Unable to change your password.'));
        this.isChangingPassword.set(false);
      }
    });
  }

  get userInitial(): string {
    const name = this.profile()?.firstName || this.authState.currentUser()?.email || 'U';
    return name.charAt(0).toUpperCase();
  }

  logout(): void {
    this.authState.logout();
    this.router.navigate(['/']);
  }

  private getErrorMessage(error: any, fallback: string): string {
    return error?.error?.message || error?.error?.title ||
      (typeof error?.error === 'string' ? error.error : '') || fallback;
  }
}
