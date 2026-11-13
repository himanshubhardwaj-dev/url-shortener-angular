import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideEye, LucideEyeOff } from '@lucide/angular';
import { Auth } from '../../../core/services/auth';
import { RegisterRequest } from '../../../models/auth/register-request.model';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideEye,
    LucideEyeOff,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

  registerForm: FormGroup;

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: Auth
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onSubmit(): void {

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formData = this.registerForm.value as RegisterRequest;

    this.auth.register(formData).subscribe({

      next: (response) => {
        this.isLoading = false;
        this.successMessage = response?.message ?? 'Account created successfully.';

        this.registerForm.reset();
        this.showPassword = false;
        this.showConfirmPassword = false;
      },

      error: (error) => {

        this.isLoading = false;

        if (error.status === 400) {

          this.errorMessage =
            error.error?.message ??
            'Unable to create your account. Please check your details.';

        } else {

          this.errorMessage = 'Something went wrong. Please try again.';
        }
      }

    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}