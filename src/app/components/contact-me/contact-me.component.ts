import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import emailjs from '@emailjs/browser';

import emailJsCredentials from './../../../assets/email-js-credentials.json';

interface FormControls {
  name: [string, ((control: AbstractControl) => ValidationErrors | null)[]],
  email: [string, ((control: AbstractControl) => ValidationErrors | null)[]],
  message: [string, ((control: AbstractControl) => ValidationErrors | null)[]],
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
    private formBuilder: FormBuilder) {

    this.createForm();
    this.emailJsInit();
  }

  public formGroup!: FormGroup;

  public sendEmail(): void {
    if (this.formGroup.invalid) {
      return;
    }
    
    const templateParams = {
      from_name: this.formGroup.controls['name'].value,
      from_email: this.formGroup.controls['email'].value,
      message: this.formGroup.controls['message'].value,
    };

    emailjs.send(emailJsCredentials.serviceId, emailJsCredentials.templateId, templateParams).then(
      (response) => {
        this.formGroup.reset();
      },
      (error) => {

      },
    );
  }

  private createForm() {
    const formControls: FormControls = {
      name: ['', [ Validators.required ]],
      email: ['', [ Validators.required, Validators.pattern(/^[a-zA-Z0-9_\.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-\.]+$/) ]],
      message: ['', [ Validators.required ]],
    };

    this.formGroup = this.formBuilder.group(formControls);
  }

  private emailJsInit(): void {
    emailjs.init({
      publicKey: emailJsCredentials.publicKey,
    });
  }

}
