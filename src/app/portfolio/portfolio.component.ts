import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import 'boxicons';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { gsap } from 'gsap';

interface PortfolioItem {
  imageUrl: string;
  id: string;
  html: string;
}

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioComponent {

  selectedIndex = 0;
  portfolio: PortfolioItem[] = [
    { imageUrl: "assets/images/portfolio/pdftoolkit.png", id: "pdftoolkit", html: "<h3>PDFToolkit</h3><p>PDFToolkit est une application Windows légère conçue pour les étudiants, permettant de fusionner, réorganiser et nettoyer leurs fichiers PDF en toute simplicité. Fonctionnant entièrement en local, elle garantit rapidité et confidentialité tout en offrant des options avancées comme la suppression de pages inutiles et la protection par mot de passe grâce à PDFium et QPDF. Disponible gratuitement sur le Microsoft Store, PDFToolkit aide à garder des documents de cours bien structurés, sécurisés et prêts à l’usage.</p><a href='https://apps.microsoft.com/detail/9nqsnbhzw382?referrer=appbadge&mode=direct'><img src='https://get.microsoft.com/images/en-us%20dark.svg' width='200'/></a>" },
    { imageUrl: "assets/images/portfolio/justflipacoin.jpg", id: "justflipacoin", html: "<h3>JustFlipACoin</h3><p>JustFlipACoin est une application mobile développée avec Flutter. Disponible sur le <a href='https://play.google.com/store/apps/details?id=com.loukag.just_flip_a_coin'>Play Store</a>, elle permet de jouer au traditionnelle pile ou face avec une pièce entièrement personnalisable. Les utilisateurs peuvent modifier l'apparence de la pièce, choisir la langue de l'application et personnaliser leur expérience. Que ce soit pour des décisions rapides ou des jeux entre amis, JustFlipACoin offre une solution pratique et amusante à portée de main.</p><iframe width='420' height='315' src='https://www.youtube-nocookie.com/embed/AQuG8isT7pU?rel=0&color=white'></iframe>" },
    { imageUrl: "assets/images/portfolio/timetunes.png", id: "timetunes", html: "<h3>TimeTunes</h3><p>TimeTunes est un jeu mobile multijoueur où les joueurs placent des chansons sur une ligne du temps selon leur date de sortie. L’app intègre Spotify, permet de jouer à distance avec des playlists personnalisées, et affiche un classement en temps réel. Projet <a href='https://github.com/LoukaG/TimeTunes'>open source</a> développé avec Flutter.</p><iframe width='420' height='315' src='https://www.youtube-nocookie.com/embed/gAwxDmS1brA?rel=0&color=white'></iframe>" },
    { imageUrl: "assets/images/portfolio/crafteverything.png", id: "crafteverything", html: "<h3>Craft Everything</h3><p>CraftEverything est un jeu mobile où les joueurs combinent des éléments pour en créer de nouveaux. Si une combinaison n’existe pas, une IA (GPT + LLaMA) génère dynamiquement un nouvel élément. Créé en moins de 24h, le projet utilise Flutter pour le frontend et un backend moderne avec Bun, Hono, Prisma et PostgreSQL. Le code est open source et disponible sur <a href='https://github.com/LoukaG/CraftEverything'>GitHub</a>.</p><iframe width='420' height='315' src='https://www.youtube-nocookie.com/embed/lbq-45wED-8?rel=0&color=white'></iframe>" },
    { imageUrl: "assets/images/portfolio/fluttercreate.png", id: "fluttercreate", html: "<h3>Flutter Create</h3><p>Flutter Create est un outil en ligne de commande interactif qui permet de créer rapidement des projets Flutter avec différents modèles. Il vous permet de spécifier le nom du projet, le nom du package et les plateformes cibles pour les modèles basés sur des plugins. L'outil met également à jour Flutter avant la création du projet et propose une option pour ouvrir automatiquement le projet dans VS Code. Le projet est open source et disponible sur <a href='https://github.com/LoukaG/flutter-create'>Github</a>.</p><img src='assets/images/portfolio/fluttercreate demo.gif' width='100%'>" },
    { imageUrl: "assets/images/portfolio/habitflow.png", id: "Habitflow", html: "<h3>Habitflow</h3><p>Habitflow est une application développée en Flutter. L'objectif est de suivre ses bonnes habitudes et d'obtenir des graphiques de nos progrès. Le code source est sur <a href='https://github.com/LoukaG/habitflow'>Github</a>.</p>" },
    { imageUrl: "assets/images/portfolio/deepfocus.png", id: "deepfocus", html: "<h3>DeepFocus</h3><p>Deepfocus est une extension pour les navigateur Chromium qui bloque les sites nuisibles tels que les réseaux sociaux, afin que vous puissiez vous concentrer sur ce qui est important. Le code source de ce projet est disponible sur <a href='https://github.com/LoukaG/deepfocus'>github</a>.</p><img src='assets/images/portfolio/deepfocus.png' width='100%'>" },
    { imageUrl: "assets/images/portfolio/battlemusic.jpg", id: "battlemusic", html: "<h3>BattleMusic</h3><p>BattleMusic est un plugin pour le jeu vidéo Minecraft publié sur le site de <a href='https://www.spigotmc.org/resources/battlemusic-1-12-1-18.73435/'>Spigot</a>. Il permet de jouer de la musique lorsque le joueur combat des monstres, comme le fait Skyrim. Le plugin a plus de 7k téléchargements et 4,3/5 étoiles. Le code source est disponible sur <a href='https://github.com/LoukaG/BattleMusic'>Github</a></p><iframe width='420' height='315' src='https://www.youtube-nocookie.com/embed/tyaUBFHXjio?rel=0&color=white'></iframe>" },
    { imageUrl: "assets/images/portfolio/smartlight.jpg", id: "smartlight", html: "<h3>SmartLight</h3><p>SmartLight est un plugin pour le jeu Minecraft qui permet de connecter des ampoules Philips Hue de manière à ce que l'intensité de la lumière soit la même que celle du joueur. Par exemple, s'il fait sombre dans le jeu, les lumières s'éteindront.</p><iframe width='420' height='315' src='https://www.youtube-nocookie.com/embed/4Al9sH00WGs?rel=0&color=white'></iframe>" },
  ];

  constructor(private http: HttpClient, private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) { }


  ngAfterViewInit() {
    let tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: '#portfolio-container',
        start: '-30% center',
        end: '20% center',
        scrub: false,
        markers: false,
      }
    });

    tl2.from('#view-portfolio', {
      opacity: 0,
    });

    tl2.to('#view-portfolio', {
      opacity: 1,
      step: "expoScale(0.5,7,none)"
    });

    let tl3 = gsap.timeline({
      scrollTrigger: {
        trigger: '#portfolio-items',
        start: '-170% center',
        end: '20% center',
        scrub: false,
        markers: false,
      }
    });

    tl3.from('#portfolio-items', {
      opacity: 0,
      step: "expoScale(0.5,7,none)"
    });

    tl3.to('#portfolio-items', {
      opacity: 1,
      step: "expoScale(0.5,7,none)"
    });

  }
  getCurrentImage(): String {
    return this.portfolio[this.selectedIndex]["imageUrl"];
  }

  getSafeHtml() {
    let html: string = this.portfolio[this.selectedIndex]["html"]
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /*
  getEmbeddedUrl(): SafeResourceUrl {
    const videoId = this.extractVideoId(this.portfolio[this.selectedIndex]["youtube_url"]);
    const embeddedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&color=white`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(embeddedUrl);
  }*/
  selectItem(id: String) {
    this.selectedIndex = this.portfolio.findIndex(item => item["id"] == id);
    this.cdr.detectChanges();
  }


}
