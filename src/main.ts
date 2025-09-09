import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

import { gsap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";



platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));


gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);