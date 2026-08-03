import { Component, OnInit } from '@angular/core';

import { ProjectsComponent } from './projects/projects.component';
import { ProcessComponent } from './process/process.component';
import { CredentialsComponent } from './credentials/credentials.component';
import { IntroSectionComponent } from './intro-section/intro-section.component';
import { FaqComponent } from './../shared/faq/faq.component';
import { CtaBandComponent } from './../shared/cta-band/cta-band.component';
import { TestimonialsComponent } from './../shared/testimonials/testimonials.component';

import { HOME_FAQ } from './../../content/home';
import { TESTIMONIALS } from './../../content/testimonials';
import { StructuredDataService } from './../../services/structured-data.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: true,
  imports: [
    ProjectsComponent,
    ProcessComponent,
    CredentialsComponent,
    IntroSectionComponent,
    FaqComponent,
    CtaBandComponent,
    TestimonialsComponent,
  ],
})

export class LandingComponent implements OnInit {

  constructor(private structuredData: StructuredDataService) { }

  public readonly faq = HOME_FAQ;

  // Checked here rather than in the template so the surrounding spacer can be
  // dropped too — an empty testimonials list would otherwise leave a double gap.
  public readonly hasTestimonials = TESTIMONIALS.length > 0;

  public ngOnInit(): void {
    this.structuredData.set([
      this.structuredData.faq(HOME_FAQ),
    ]);
  }

}
