import * as THREE from "three";
import BasicCharacterControls from "./FSMController";
import ThirdPersonCamera from "./ThirdPersonCamera";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let // pane,
  scene,
  camera,
  controls,
  renderer,
  charControls,
  thirdPersonCamera,
  previousFrame = null,
  alien,
  mixerMutant,
  mixerDragon,
  monsterLight,
  dragonLight;

export const renderScene = () => {
  init();
  charControls = new BasicCharacterControls({ scene, alien });
  thirdPersonCamera = new ThirdPersonCamera({
    camera: camera,
    target: charControls,
  });

  let loader = new FBXLoader();
  loader.load("mutant.fbx", function (mutant) {
    mutant.scale.setScalar(0.04);
    mutant.position.set(0, 0, 40);
    mutant.rotation.y = Math.PI;
    mutant.traverse((child) => (child.castShadow = true));
    monsterLight.position.set(
      mutant.position.x,
      mutant.position.y - 1,
      mutant.position.z - 10
    );
    monsterLight.rotation.x = Math.PI;
    monsterLight.target = mutant;

    scene.add(mutant);

    mixerMutant = new THREE.AnimationMixer(mutant);
    loader.load("/animations/mutant_swiping.fbx", function (danceClip) {
      // console.log(danceClip);
      let danceAction = mixerMutant.clipAction(danceClip.animations[0]);
      danceAction.play();
    });
  });

  loader.load(
    "/source/ef2da8ba53194e35a4be77969cff3949.fbx.fbx",
    function (dragon) {
      // console.log(dragon);
      dragon.scale.setScalar(0.01);
      dragon.children[2] = dragon.children[3];
      dragon.children.pop();
      dragon.position.set(-70, 0.1, 10);
      dragon.rotation.y = Math.PI / 2;
      dragon.traverse((child) => (child.castShadow = true));

      dragonLight.position.set(
        dragon.position.x + 50,
        dragon.position.y + 2,
        dragon.position.z
      );
      dragonLight.rotation.x = Math.PI;
      dragonLight.target = dragon;

      scene.add(dragon);
      mixerDragon = new THREE.AnimationMixer(dragon);
      let anim = mixerDragon.clipAction(dragon.animations[0]);
      anim.play();
    }
  );

  let gltfLoader = new GLTFLoader();
  gltfLoader.load("/source/pine.glb", function (glb) {
    // console.log(glb);
    glb.scene.scale.setScalar(5);
    glb.scene.position.y = -0.2;
    glb.scene.children.shift();
    glb.scene.children.forEach((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
    });
    scene.add(glb.scene);
  });

  scene.add(
    monsterLight,
    // new THREE.SpotLightHelper(monsterLight),
    dragonLight
    // new THREE.SpotLightHelper(dragonLight)
  );

  animate();
};

function animate() {
  requestAnimationFrame((t) => {
    if (previousFrame === null) {
      previousFrame = t;
    }
    animate();
    controls.update();
    charControls.Update((t - previousFrame) * 0.001);
    thirdPersonCamera.Update((t - previousFrame) * 0.001);

    if (mixerMutant) mixerMutant.update((t - previousFrame) * 0.001);
    if (mixerDragon) mixerDragon.update((t - previousFrame) * 0.001);

    renderer.render(scene, camera);
    previousFrame = t;
  });
}

function init() {
  document.body.style.backgroundColor = "#000";
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  camera.position.set(50, 30, 0);

  const dlight = new THREE.SpotLight("white");
  const frontLight = new THREE.DirectionalLight("white");
  frontLight.position.set(0, 150, 100);
  frontLight.castShadow = true;
  dlight.position.set(0, 100, 0);
  dlight.castShadow = true;
  let hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 2);

  let grid = new THREE.GridHelper(100, 100);
  grid.receiveShadow = true;

  let ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100, 100, 100),
    new THREE.MeshStandardMaterial({ color: 0x000000 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;

  // let groundLights = new THREE.Group();
  // groundLights.add(positionedLight(50, 0, 0));
  // groundLights.add(positionedLight(50, 50, 0));
  // groundLights.add(positionedLight(50, -50, 0));
  // groundLights.add(positionedLight(-50, 0, 0));
  // groundLights.add(positionedLight(-50, 50, 0));
  // groundLights.add(positionedLight(-50, -50, 0));
  // groundLights.add(positionedLight(0, 50, 0));
  // groundLights.add(positionedLight(0, -50, 0));
  monsterLight = new THREE.SpotLight("cyan", 2);
  dragonLight = new THREE.SpotLight("red", 2);
  // monsterLight.decay = 100;
  // monsterLight.angle = Math.PI / 10;

  let sun = new THREE.SpotLight("white");
  sun.position.set(100, 50, -10);
  sun.castShadow = true;
  sun.power = 10;

  let sunlight = new THREE.DirectionalLight("white", 3);
  sunlight.castShadow = true;
  sunlight.position.copy(sun.position);

  let orb = new THREE.PointLight("white", 2);
  orb.position.set(0, 10, 0);
  scene.add(
    hemiLight,
    sun,
    sunlight
    // new THREE.SpotLightHelper(sun),
    // orb
    // new THREE.PointLightHelper(orb)
    // groundLights
    // grid,
    // ground
    // new THREE.SpotLightHelper(dlight),
    // new THREE.DirectionalLightHelper(frontLight)
  );
  scene.fog = new THREE.Fog(0x000000, 0.1, 50);
}

function positionedLight(x, y, z) {
  let light = new THREE.SpotLight("white", 0.6);
  light.position.set(x, y + 50, z);
  return light;
}
