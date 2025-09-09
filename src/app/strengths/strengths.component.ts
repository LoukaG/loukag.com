import { Component } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-strengths',
  templateUrl: './strengths.component.html',
  styleUrls: ['./strengths.component.css']
})
export class StrengthsComponent {

  ngAfterViewInit() {
    let tlQual1 = gsap.timeline({
      scrollTrigger: {
        trigger: '#quality1',
        start: '-75% center',
        end: '0% center',
        scrub: false,
        markers: false,
      }
    });

    tlQual1.from('#quality1', {
      opacity: 0,
      scale: 0.95,
      step: "expoScale(0.5,7,none)"
    });

    tlQual1.from('#title', {
      opacity: 0,
      step: "expoScale(0.5,7,none)"
    });

    let tlQual2 = gsap.timeline({
      scrollTrigger: {
        trigger: '#quality2',
        start: '-75% center',
        end: '0% center',
        scrub: false,
        markers: false,
      }
    });

    tlQual2.from('#quality2', {
      opacity: 0,
      scale: 0.95,
      step: "expoScale(0.5,7,none)"
    });

    let tlQual3 = gsap.timeline({
      scrollTrigger: {
        trigger: '#quality3',
        start: '-45% center',
        end: '0% center',
        scrub: false,
        markers: false,
      }
    });

    tlQual3.from('#quality3', {
      opacity: 0,
      scale: 0.95,
      step: "expoScale(0.5,7,none)"
    });
  }
}
