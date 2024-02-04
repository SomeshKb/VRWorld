import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, Inject, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import 'aframe';
import 'aframe-extras';
import 'aframe-environment-component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [{ provide: Document, useValue: Document }],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent implements AfterViewInit {

  @ViewChild("test") myModelEntity: ElementRef | undefined;

  isAnimationPlaying = false;

  ngAfterViewInit(): void {
  }

  constructor() {

  }

  playAndPauseAnimation() {
    //https://github.com/c-frame/aframe-extras/blob/master/examples/animation-controls/animation-controls.js
    //https://github.com/c-frame/aframe-extras/tree/master/src/loaders#animation
    const modelEntity = this.myModelEntity?.nativeElement;
    console.log(modelEntity.components)
    if(this.isAnimationPlaying){
      modelEntity.setAttribute('animation-mixer', {clip: "none"})
    } else {
      modelEntity.setAttribute('animation-mixer', {clip: "*"})
    }
    this.isAnimationPlaying = !this.isAnimationPlaying;
  }

}
