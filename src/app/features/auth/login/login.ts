import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../../core/services/auth';
import { LoginRequest } from '../../../models/auth/login-request.model';
import { LucideEye, LucideEyeOff } from '@lucide/angular';
import { AuthState } from '../../../core/services/auth-state';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, LucideEye, LucideEyeOff],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  showPassword = false;
  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private authState: AuthState
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const loginData = this.loginForm.value as LoginRequest;

    this.auth.login(loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.authState.setSession(response.token);
        this.successMessage = 'Login successfull!'
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401) {
          this.errorMessage = 'Invalid Email or Password.';
        }
        else if (error.status === 400) {
          this.errorMessage = error.error?.message ?? 'Please check your login details.'
        }
        else {
          this.errorMessage = 'Something went wrong. Please try again.'
        }
      }
    })
  }
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
