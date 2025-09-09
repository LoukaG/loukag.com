import { Component, EventEmitter, ChangeDetectorRef, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import gsap from 'gsap';

interface PortfolioItem {
  imageUrl: string;
  id: string;
  html: string;
}

@Component({
  selector: 'app-portfolio-items',
  templateUrl: './portfolio-items.component.html',
  styleUrls: ['./portfolio-items.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioItemsComponent {

  currentPage = 1;
  @Input() portfolio: PortfolioItem[] = [];
  @Output() selectItemEvent = new EventEmitter<String>();

  constructor(private http: HttpClient, private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) {}

  getPortfolioItems(): any {
    return this.portfolio.slice((this.currentPage - 1) * 3, this.currentPage * 3);
  }

  

  selectItem(id: String){
    this.selectItemEvent.emit(id);
  }
  

  nextPage(){
    gsap.fromTo('.thumbnailContainer', { x: 0 }, { x: -100, opacity: 0, duration: 0.25 }).then(() => {
      if(this.currentPage == (Math.ceil(this.portfolio.length / 3)))
        this.currentPage = 1;
      else
        this.currentPage += 1;
      this.cdr.detectChanges();
      gsap.fromTo('.thumbnailContainer', { x: 100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.25 });
    });
    
    
  }

  previousPage(){
    gsap.fromTo('.thumbnailContainer', { x: 0 }, { x: 100, opacity: 0, duration: 0.25 }).then(() => {
      if(this.currentPage == 1)
        this.currentPage = Math.ceil(this.portfolio.length / 3);
      else
        this.currentPage -= 1;

      this.cdr.detectChanges();

      gsap.fromTo('.thumbnailContainer', { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.25 });
    });
    
  }

  animatePageChange(){
    gsap.fromTo('.thumbnailContainer', { x: 0 }, { x: -100, opacity: 0, duration: 1 });
    gsap.fromTo('.thumbnailContainer', { x: 100, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }).delay(1);
  }
}
