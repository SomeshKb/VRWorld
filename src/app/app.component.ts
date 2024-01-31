import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, Inject, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import 'aframe';
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

  @ViewChild("test") myModelEntity: any;

  constructor(private el: ElementRef) { }

  ngAfterViewInit(): void {

  }

  handleEntityClick() {
    console.log("op")
    const myModelEntity = this.el.nativeElement.querySelector('#myModel');
    // or
    // const myModelEntity = this.myModelRef.nativeElement;

    if (myModelEntity) {
      // Access animations using A-Frame API
      const animations = myModelEntity.getObject3D('gltf').animations;

      // Log animation information to the console
      animations.forEach((animation: any, index: any) => {
        console.log(`Animation ${index}:`, animation);
      });

      // Play the first animation (adjust the index if needed)
      myModelEntity.setAttribute('animation-mixer', { clip: animations[0].name, loop: 'repeat' });
    }
  }

}
