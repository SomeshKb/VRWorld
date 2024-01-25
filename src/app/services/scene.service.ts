import { Injectable } from '@angular/core';
import {
  AmbientLight,
  AnimationMixer,
  AxesHelper,
  CameraHelper,
  Clock,
  Color,
  DoubleSide,
  EquirectangularReflectionMapping,
  Euler,
  GridHelper,
  HemisphereLight,
  LoadingManager,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  sRGBEncoding,
  Texture,
  Vector3,
  WebGLRenderer,
} from 'three';

import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { OrbitControlsGizmo } from "../../assets/OrbitControlsGizmo/OrbitControlsGizmo.js";
import { OrbitControls } from '../../assets/OrbitControlCustom/OrbitControls.js';


@Injectable({
  providedIn: 'root'
})
export class SceneService {
  aspect!: number;
  camera!: PerspectiveCamera;
  container!: HTMLElement;
  orbitControls!: OrbitControls;
  hemisphere!: HemisphereLight;
  loader!: GLTFLoader;
  mainLight!: AmbientLight;
  scene!: Scene;
  transformControls!: TransformControls;
  deltaX = 0.01;
  deltaY = 0.01;
  deltaZ = 0.01;
  far = 100;
  fov = 50;
  gammaFactor = 2.2;
  gammaOutput = true;
  near = 1;
  physicallyCorrectLights = true;
  sceneBackground = 0x8fbcd4;
  renderer = new WebGLRenderer({ antialias: true });

  clock = new Clock();
  mixers = new Array<AnimationMixer>();

  modelPosition = new Vector3(0, -1, 0);
  modelScale = new Vector3(0.01, 0.01, 0.01);

  loadingManager: LoadingManager = new LoadingManager();

  directionalLightOptions = {
    color: 0xece1bc,
    intensity: 20,
  };

  hemisphereOptions = {
    skyColor: 0xffeeb1,
    groundColor: 0x08020,
    intensity: 4,
  };

  axesHelper: AxesHelper | undefined;
  gridHelper: GridHelper | undefined;

  // CAMERA

  private createCamera = () => {
    this.camera = new PerspectiveCamera(
      this.fov,
      this.aspect,
      this.near,
      this.far
    );

    this.camera.position.set(7, 4, 9.5);
  };

  constructor(private document: Document){
  }

  // CONTROLS

  private createControls = () => {
    this.orbitControls = new OrbitControls(this.camera, this.container);
    const controlsGizmo = new OrbitControlsGizmo(this.orbitControls, { size: 100, padding: 8 });
    this.container.appendChild(controlsGizmo.domElement);
  }

  // LIGHTING

  private createLight = () => {
    // this.hemisphere = new HemisphereLight(
    //   this.hemisphereOptions.skyColor,
    //   this.hemisphereOptions.groundColor,
    //   this.hemisphereOptions.intensity
    // );

    this.mainLight = new AmbientLight(
      this.directionalLightOptions.color,
      this.directionalLightOptions.intensity,
    );
    this.mainLight.position.set(-7, -4, -9.5);


    // this.scene.add(this.hemisphere);
  };

  // GEOMETRY

  public createModels = (modelPath: string, modelPosition: Vector3, modelScale: Vector3, modelName: string, modelId: string) => {
    return new Promise((resolve, reject) => {

      this.loader = new GLTFLoader(this.loadingManager);
      const loadModel = (gltf: GLTF) => {
        const model = gltf.scene.children[0];
        model.position.copy(modelPosition);
        model.scale.copy(modelScale);
        model.userData = { id: modelId, name: modelName }
        const animation = gltf.animations[0];

        if (animation) {
          const mixer = new AnimationMixer(model);
          this.mixers.push(mixer);

          const action = mixer.clipAction(animation);
          // action.play();
        }
        this.scene.add(model);

        this.setTransformControl(model)
        resolve(model);
      };

      this.loader.load(
        modelPath,
        (gltf) => {
          loadModel(gltf);
        },
        () => { },
        (err) => reject(err)
      );
    })
  };

  // RENDERER

  private onWindowResize = () => {
    this.camera.aspect =
      this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer &&
      this.renderer.setSize(
        this.container.clientWidth,
        this.container.clientHeight
      );
  };

  setTransformControl(model: Object3D) {
    this.orbitControls.enabled = false;
    this.transformControls?.detach();

    this.transformControls.attach(model);
    this.scene.add(this.transformControls);
  }

  private createRenderer = () => {
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    // this.renderer.setPixelRatio(window.devicePixelRatio);
    // this.renderer.gammaFactor = this.gammaFactor;
    // this.renderer.gammaOutput = true;
    // this.renderer.physicallyCorrectLights = true;
    // this.renderer.outputEncoding = sRGBEncoding;


    this.container.appendChild(this.renderer.domElement);
    window.addEventListener('resize', this.onWindowResize);
  };

  private update = () => {
    const delta = this.clock.getDelta();
    this.mixers.forEach((x) => x.update(delta));
  };

  private render = () => this.renderer.render(this.scene, this.camera);

  start = () =>
    this.renderer.setAnimationLoop(() => {
      this.update();
      this.render();
      if (this.transformControls) {
        this.transformControls.updateMatrixWorld();
      }
    });

  stop = () => this.renderer.setAnimationLoop(() => { });

  initialize = (container: HTMLElement) => {
    this.container = container;
    this.scene = new Scene();
    this.scene.background = new Color(this.sceneBackground);
    this.aspect = container.clientWidth / container.clientHeight;

    this.createCamera();
    this.createControls();
    this.createLight();
    this.addAxesHelper();
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.initializeLoadingManager();
    this.createRenderer();
    this.setEnviromentLighting().then((texture: any) => {
      this.scene.environment = texture;
    })
    this.start();

  };

  setEnviromentLighting() {
    return new Promise((resolve, reject) => {
      new RGBELoader(this.loadingManager).load('./assets/hdr/venice_sunset.hdr', (texture: Texture) => {
        texture.mapping = EquirectangularReflectionMapping;
        resolve(texture);
      })
    });
  }

  initializeLoadingManager() {
    this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {

      // console.log()
    //   const loadingElement = this.document.getElementById('loader')?.parentElement;
    //   loadingElement?.classList.remove('fade-out');
    // };

    // this.loadingManager.onLoad = () => {
    //   const loadingElement = this.document.getElementById('loader')?.parentElement;
    //   loadingElement?.classList.add('fade-out');
    // };

    // this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {

    //   const loadingElement = this.document.getElementById('loader')?.parentElement;
    //   // const loadingTextDiv = loadingElement?.lastChild as HTMLElement;
    //   // loadingTextDiv.innerText = Math.round(itemsLoaded / itemsTotal * 100,) + '%';
    // };

    // this.loadingManager.onError = (url) => {
    //   console.log('There was an error loading ' + url);
    };
  }

  createPlane(position?: Vector3, rotation?: Euler, scale?: Vector3) {
    const planeGeometry = new PlaneGeometry(10, 10);
    const planeMaterial = new MeshBasicMaterial({
      color: 0x6b6b6b,
      side: DoubleSide,
    });
    const plane = new Mesh(planeGeometry, planeMaterial);
    position ? plane.position.copy(position) : plane.position.set(0, 0, 0)
    rotation ? plane.rotation.copy(rotation) : plane.rotation.set(Math.PI / 2, 0, 0);
    scale ? plane.scale.copy(scale) : plane.scale.set(1, 1, 1);

    this.scene.add(plane);
    this.transformControls.add(plane);
    plane['userData'] = { name: "Plane", id: "plane" }
    this.setTransformControl(plane)
    return plane;
  }


  addAxesHelper() {
    this.axesHelper = new AxesHelper(100);
    this.scene.add(this.axesHelper);

    const size = 100;
    const divisions = 200;

    this.gridHelper = new GridHelper(size, divisions);
    this.scene.add(this.gridHelper);
  }
}
