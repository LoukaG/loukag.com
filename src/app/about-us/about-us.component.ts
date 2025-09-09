import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent implements AfterViewInit, OnDestroy {
  ageString: string = '';
  private intervalId: any;

  ngAfterViewInit() {
    let tlImage = gsap.timeline({
      scrollTrigger: {
        trigger: '.imageCol',
        start: '-75% center',
        end: '0% center',
        scrub: false,
        markers: false,
      }
    });

    tlImage.from('.imageCol', {
      opacity: 0,
      scale: 0.95,
      step: "expoScale(0.5,7,none)"
    });

    let tlText = gsap.timeline({
      scrollTrigger: {
        trigger: '.textCol',
        start: '-75% center',
        end: '0% center',
        scrub: false,
        markers: false,
      }
    });

    tlText.from('.textCol', {
      opacity: 0,
      step: "expoScale(0.5,7,none)"
    });

    this.updateAge();
    this.intervalId = setInterval(() => this.updateAge(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  updateAge() {
    const birth = new Date(2002, 4, 5, 0, 0, 0); // Mois 4 = Mai (0-indexé)
    const now = new Date();

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    let hours = now.getHours() - birth.getHours();
    let minutes = now.getMinutes() - birth.getMinutes();
    let seconds = now.getSeconds() - birth.getSeconds();

    if (seconds < 0) {
      seconds += 60;
      minutes--;
    }
    if (minutes < 0) {
      minutes += 60;
      hours--;
    }
    if (hours < 0) {
      hours += 24;
      days--;
    }
    if (days < 0) {
      // Get days in previous month
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }
    if (months < 0) {
      months += 12;
      years--;
    }

    this.ageString = `${years} ans, ${months} mois, ${days} jours, ${hours}h ${minutes}m ${seconds}s`;
  }
}
