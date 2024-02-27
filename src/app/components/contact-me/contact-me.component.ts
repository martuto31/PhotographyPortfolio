import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

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
  }

  public formGroup!: FormGroup;

  private createForm() {
    const formControls: FormControls = {
      name: ['', [ Validators.required ]],
      email: ['', [ Validators.required, Validators.pattern(/^[a-zA-Z0-9_\.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-\.]+$/) ]],
      message: ['', [ Validators.required ]],
    };

    this.formGroup = this.formBuilder.group(formControls);
  }

}
