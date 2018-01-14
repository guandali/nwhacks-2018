import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routing';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { SignupComponent } from './signup/signup.component';
import { LandingComponent } from './landing/landing.component';
import { ProfileComponent } from './profile/profile.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';

// File upload module
import { FileUploadModule } from 'ng2-file-upload';

import * as cloudinary from 'cloudinary-core';
import cloudinaryConfiguration from './cloud_config';

import { HomeModule } from './home/home.module';
// Cloudinary module
import { CloudinaryModule, CloudinaryConfiguration } from '@cloudinary/angular-4.x';

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    LandingComponent,
    ProfileComponent,
    NavbarComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    NgbModule.forRoot(),
    FormsModule,
    RouterModule,
    AppRoutingModule,
    HomeModule,
    FileUploadModule,
    HttpClientModule,
    CloudinaryModule.forRoot(cloudinary, cloudinaryConfiguration as CloudinaryConfiguration)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
