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
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppComponent implements AfterViewInit {

  ngAfterViewInit(): void {
  }

}
