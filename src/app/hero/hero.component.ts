import { Component } from '@angular/core';
import { gsap } from 'gsap';


@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent {
  
  mouseX : number = 50;

  onMouseMove(event: MouseEvent) {
    this.mouseX = ((event.clientX / window.innerWidth) * 100)-1;
  }
}
