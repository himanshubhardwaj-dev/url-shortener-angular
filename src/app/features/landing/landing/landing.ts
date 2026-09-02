import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    CommonModule
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class LandingComponent {
  longUrl: string = '';
  shortUrl: string = '';
  errorMessage: string = '';
  copied: boolean = false;

  scrollToShortener(): void {
    document.getElementById('shortener')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }

  scrollToHowItWorks(): void {
    document.getElementById('how-it-works')?.scrollIntoView({
      behavior: 'smooth'
    })
  }
  shortenUrl(): void {
    this.errorMessage = '';
    this.shortUrl = '';
    this.copied = false;

    if (!this.longUrl.trim()) {
      this.errorMessage = 'Please enter a URL first.'
      return;
    }
    try {
      new URL(this.longUrl);
    }
    catch {
      this.errorMessage = 'Please enter a valid URL (example: https://google.com)';
      return;
    }
    const randomCode = Math.random().toString(36).substring(2, 8);
    this.shortUrl = `shortly.local/${randomCode}`;
  }
  copyShortUrl(): void {
    navigator.clipboard.writeText(this.shortUrl).then(() => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000)
    });
  }
}
