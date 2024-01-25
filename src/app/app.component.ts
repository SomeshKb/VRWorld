import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import * as THREE from 'three';
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    const width = window.innerWidth, height = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10);
    camera.position.z = 1;
    const scene = new THREE.Scene();

    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshNormalMaterial();

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setAnimationLoop(animation);
    document.body.appendChild(renderer.domElement);

    // animation

    function animation(time: number) {

      mesh.rotation.x = time / 2000;
      mesh.rotation.y = time / 1000;

      renderer.render(scene, camera);

    }
  }
  title = 'VRWorld';
}
