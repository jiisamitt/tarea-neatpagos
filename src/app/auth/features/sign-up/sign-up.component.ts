import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AuthService } from '../../data-access/auth.service';
import { hasEmailError, isRequired } from '../../utils/validators';
import { toast } from 'ngx-sonner';
import { Router } from '@angular/router';
import { GoogleButtonComponent } from '../../ui/google-button/google-button.component';

interface FormSignUp {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, GoogleButtonComponent],
  templateUrl: './sign-up.component.html',
  styles: ``,
})
export default class SignUpComponent {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _router = inject(Router);

  isRequired(field: 'email' | 'password') {
    return isRequired(field, this.form);
  }

  hasEmailError() {
    return hasEmailError(this.form);
  }

  form = this._formBuilder.group<FormSignUp>({
    email: this._formBuilder.control('', [
      Validators.required,
      Validators.email,
    ]),
    password: this._formBuilder.control('', [Validators.required]),
  });

  async submit() {
    if (this.form.invalid) {
      console.log('error');
      return;
    }

    try {
      const { email, password } = this.form.value;

      if (!email || !password) return;

      await this._authService.signUp({ email, password });
      toast.success('¡Usuario registrado correctamente!');

      this._router.navigate(['/dashboard']);
    } catch (error) {
      console.error('error');
      toast.error('Error al registrar usuario');
    }
  }

  async submitWithGoogle() {
    try {
      await this._authService.signInWithGoogle();
      toast.success('¡Bienvenido!');
      this._router.navigateByUrl('/dashboard');
    } catch (error) {
      toast.error('Ocurrio un error');
    }
  }
}
