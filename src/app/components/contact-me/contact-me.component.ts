import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatSnackBar } from '@angular/material/snack-bar';

interface FormControls {
  name: FormControl<string | null>;
  email: FormControl<string | null>;
  message: FormControl<string | null>;
}

// Inbox that inquiries are addressed to.
const CONTACT_EMAIL = 'phbyviki@gmail.com';

@Component({
  selector: 'app-contact-me',
  templateUrl: './contact-me.component.html',
  styleUrls: ['./contact-me.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
  ],
})

export class ContactMeComponent {

  constructor(
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder) {

    this.createForm();
  }

  public formGroup!: FormGroup<FormControls>;

  // Build a prefilled Gmail compose window from the form and open it in a new tab.
  // Works in any browser without a configured desktop mail app (the common case
  // on Windows, where mailto: opens nothing useful). No backend, no credentials.
  public sendEmail(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();

      return;
    }

    const { name, email, message } = this.formGroup.getRawValue();

    const subject = `Запитване от ${name}`;
    const body =
      `Име: ${name}\n` +
      `Имейл: ${email}\n\n` +
      `${message}`;

    const gmailCompose = 'https://mail.google.com/mail/?view=cm&fs=1' +
      `&to=${encodeURIComponent(CONTACT_EMAIL)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.open(gmailCompose, '_blank', 'noopener');

    this.openSnackBar('Отваряме Gmail…', 'success');

    this.formGroup.reset();
  }

  public hasError(controlName: string, errorName: string) {
    return this.formGroup.get(controlName)?.hasError(errorName) && this.formGroup.get(controlName)?.touched;
  }

  private openSnackBar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'x', {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-error'],
    });
  }

  private createForm() {
    const formControls: FormControls = {
      name: this.formBuilder.control('', [ Validators.required ]),
      email: this.formBuilder.control('', [ Validators.required, Validators.pattern(/^[a-zA-Z0-9_\.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-\.]+$/) ]),
      message: this.formBuilder.control('', [ Validators.required ]),
    };

    this.formGroup = this.formBuilder.group(formControls);
  }

}
