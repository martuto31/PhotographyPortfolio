import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatSnackBar } from '@angular/material/snack-bar';

import emailjs from '@emailjs/browser';

import emailJsCredentials from './../../../assets/email-js-credentials.json';

interface FormControls {
  name: FormControl<string | null>;
  email: FormControl<string | null>;
  message: FormControl<string | null>;
}

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
    this.emailJsInit();
  }

  public formGroup!: FormGroup<FormControls>;

  public sendEmail(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      
      return;
    }
    
    const templateParams = {
      from_name: this.formGroup.controls.name.value,
      from_email: this.formGroup.controls.email.value,
      message: this.formGroup.controls.message.value,
    };

    emailjs.send(emailJsCredentials.serviceId, emailJsCredentials.templateId, templateParams).then(
      (response) => {
        this.formGroup.reset();

        this.openSnackBar('Съобщението е изпратено успешно!', 'success');
      },
      (error) => {
        this.snackBar.open('Възникна грешка!', 'error');
      },
    );
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

  private emailJsInit(): void {
    emailjs.init({
      publicKey: emailJsCredentials.publicKey,
    });
  }

}
