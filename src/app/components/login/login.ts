import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmailAvailabilityValidator } from '../../validators/email-availability.validator';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private emailValidator = inject(EmailAvailabilityValidator);

  errorMessage = signal('');
  isSubmitting = signal(false);
  emailTouched = signal(false);
  passwordTouched = signal(false);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email], [this.emailValidator.validateEmailAvailability()]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get emailError(): string {
    if (!this.emailTouched()) return '';
    if (this.email?.hasError('required')) return 'Email is required.';
    if (this.email?.hasError('email')) return 'Enter a valid email.';
    if (this.email?.hasError('emailTaken')) return 'This email is already reserved.';
    return '';
  }

  get passwordError(): string {
    if (!this.passwordTouched()) return '';
    if (this.password?.hasError('required')) return 'Password is required.';
    if (this.password?.hasError('minlength')) return 'Password must be at least 6 characters.';
    return '';
  }

  submit() {
    this.emailTouched.set(true);
    this.passwordTouched.set(true);

    if (this.loginForm.invalid) {
      this.errorMessage.set('Please fix the highlighted fields.');
      return;
    }

    this.errorMessage.set('');
    this.isSubmitting.set(true);

    const success = this.authService.login(this.email?.value, this.password?.value);

    if (success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set('Invalid login details.');
    }

    this.isSubmitting.set(false);
  }
}
