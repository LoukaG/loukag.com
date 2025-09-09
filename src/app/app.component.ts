import { Component } from '@angular/core';
import { gsap } from 'gsap';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'LoukaG';

  ngAfterViewInit() {
    console.log("Test")
    gsap.fromTo('#preloader', { opacity: 1 }, { opacity: 0, duration: 1 }).delay(0.5).then(() => {
      document.getElementById('preloader')?.remove();
    });
    
  }
}
