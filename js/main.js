/* jshint sub: true */
/* jshint browser: true*/
/* global THREE:true */
/* global dat: true*/
'use strict';


// main.js
var container, dof;

var scene, camera, controls, renderer, loader, postprocessing = {};

var degrees = Math.PI / 180;

var WIDTH, HEIGHT;

var webGLElement = document.getElementById('WebGL-output');
var guiElement = document.getElementById('GUI-output');
var statusElement = document.getElementById('status-output');

var clock = new THREE.Clock();

// Paths
var path = "images/";
var modelPath = "models/";

var skyboxImages = [
  path + "px.jpg",
  path + "nx.jpg",
  path + "py.jpg",
  path + "ny.jpg",
  path + "pz.jpg",
  path + "nz.jpg"
];

init();
animate();

function init() {

  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;

  // Add a renderer to the body
  renderer = new THREE.WebGLRenderer({antialias:false});
  renderer.setClearColor(new THREE.Color(0x888, 1.0));
  renderer.setSize(WIDTH, HEIGHT);

  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;

  renderer.autoClear = false;

  // The scene
  scene = new THREE.Scene();
  scene.castShadow = true;
  scene.receiveShadow = true;
  // scene.fog = new THREE.Fog(0x000000, 0.1, 1000);


  //////////////////////////////////////////////////////////////////////////////
  //  CAMERA / CAMERA CONTROLS                                                //
  //////////////////////////////////////////////////////////////////////////////

  camera = new THREE.PerspectiveCamera( 45, WIDTH / HEIGHT, 0.1, 50000 );
  camera.translateX(695-63-21-35);
  camera.translateY(10);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  //camera.rotateZ(90 * Math.PI / 180);

  controls = new THREE.FlyControls(camera);
  controls.movementSpeed = 100;
  controls.rollSpeed = 0.6;
  controls.autoForward = false;
  controls.dragToLook = true;

  webGLElement.appendChild(renderer.domElement);

  // scene.add(camera);


  // Resize everything when the window resizes
  window.addEventListener('resize', function() {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
    postprocessing.composer.setSize( WIDTH, HEIGHT );
  });


  //////////////////////////////////////////////////////////////////////////////
  //  SKYBOX [DISABLED]                                                       //
  //////////////////////////////////////////////////////////////////////////////

  // Loads the skybox texture
  var cubeMap = THREE.ImageUtils.loadTextureCube(skyboxImages);

  var cubeMapShader = THREE.ShaderLib["cube"];

  cubeMapShader.uniforms["tCube"].value = cubeMap;

  var skyboxMaterial = new THREE.ShaderMaterial({
    fragmentShader: cubeMapShader.fragmentShader,
    vertexShader: cubeMapShader.vertexShader,
    uniforms: cubeMapShader.uniforms,
    side: THREE.BackSide  // we'll only see the inside of the cube
  });

  var skyboxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
  var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

  // scene.add(skybox);


  //////////////////////////////////////////////////////////////////////////////
  //  OBJECTS/GEOMETRY                                                        //
  //////////////////////////////////////////////////////////////////////////////

  loadScene(scene);

  var pointLightMaterial = new THREE.MeshLambertMaterial({
    color: 0xFFCE3C,
    emissive: 0xFFDA69,
    shading: THREE.FlatShading
  });
  var pointLightGeom = new THREE.IcosahedronGeometry(5);

  var pointLight1 = new THREE.Object3D();
  pointLight1.add( new THREE.Mesh ( pointLightGeom, pointLightMaterial ) );
  pointLight1.add( new THREE.PointLight(0xFFCE3C, 1.0, 500) );
  pointLight1.translateY(144);
  pointLight1.translateX(488);
  pointLight1.translateZ(142);

  var pointLight2 = new THREE.Object3D();
  pointLight2.add( new THREE.Mesh ( pointLightGeom, pointLightMaterial ) );
  pointLight2.add( new THREE.PointLight(0xFFCE3C, 1.0, 500) );
  pointLight2.translateY(144);
  pointLight2.translateX(-621);//-488);
  pointLight2.translateZ(142);

  var pointLight3 = new THREE.Object3D();
  pointLight3.add( new THREE.Mesh ( pointLightGeom, pointLightMaterial ) );
  pointLight3.add( new THREE.PointLight(0xFFCE3C, 1.0, 500) );
  pointLight3.translateY(144);
  pointLight3.translateX(488);
  pointLight3.translateZ(-220);//-142);

  var pointLight4 = new THREE.Object3D();
  pointLight4.add( new THREE.Mesh ( pointLightGeom, pointLightMaterial ) );
  pointLight4.add( new THREE.PointLight(0xFFCE3C, 1.0, 500) );
  pointLight4.translateY(144);
  pointLight4.translateX(-621);
  pointLight4.translateZ(-220);

  scene.add(pointLight1);
  scene.add(pointLight2);
  scene.add(pointLight3);
  scene.add(pointLight4);


  //////////////////////////////////////////////////////////////////////////////
  //  LIGHTS                                                                  //
  //////////////////////////////////////////////////////////////////////////////

  var directionalLight = new THREE.DirectionalLight(0xFFFFE4, 2);
  // directionalLight.shadowCameraVisible = true;
  directionalLight.castShadow = true;
  directionalLight.shadowBias = 0;
  directionalLight.shadowDarkness = 0.5;
  directionalLight.shadowCameraNear = 0.1;
  directionalLight.shadowCameraFar = 3000;
  directionalLight.shadowMapWidth = 512;
  directionalLight.shadowMapHeight = 512;
  directionalLight.shadowCameraLeft = -1000;
  directionalLight.shadowCameraRight = 1000;
  directionalLight.shadowCameraTop = 1500;
  directionalLight.shadowCameraBottom = -1500;
  directionalLight.up = new THREE.Vector3( 0, 1, 0 );
  directionalLight.translateY(1952);
  directionalLight.rotation.set(1, 1, 0);
  scene.add(directionalLight);

  var hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFC87F, 0.9);
  scene.add(hemisphereLight);


  //////////////////////////////////////////////////////////////////////////////
  //  POST-PROCESSING                                                         //
  //////////////////////////////////////////////////////////////////////////////

  initPostProcessing();
  //renderer.autoClear = false;


  //////////////////////////////////////////////////////////////////////////////
  //  CONTROLS                                                                //
  //////////////////////////////////////////////////////////////////////////////

  var DepthOfField = function() {
    this.enableDoF = true;
    this.focus = 1.001;
    this.aperture = 0.75;
    this.maxblur = 0.01;
  };

  var updateFocus = function(value) {
    postprocessing.bokeh.uniforms[ "focus" ].value = dof.focus;
  };

  var updateAperature = function(value) {
    postprocessing.bokeh.uniforms[ "aperture" ].value = dof.aperture;
  };

  var updateMaxBlur = function(value) {
    postprocessing.bokeh.uniforms[ "maxblur" ].value = dof.maxblur;
  };

  window.onload = function() {
    dof = new DepthOfField();
    var gui = new dat.GUI({domElement: guiElement});
    gui.add(dof, 'enableDoF');
    gui.add(dof, "focus", 0.99, 1.01).step(0.001).onChange( updateFocus );
    gui.add(dof, "aperture", 0.001, 2).onChange( updateAperature );
    gui.add(dof, "maxblur", 0.0, 0.02).onChange( updateMaxBlur );
  };

}

function loadScene(scene) {

  loader = new THREE.BinaryLoader( true );
  loader.statusDomElement.style.fontSize = "2em";
  loader.statusDomElement.style.top = "50%";
  loader.statusDomElement.style.right = "40%";
  loader.statusDomElement.style.padding = "";
  loader.statusDomElement.style.textAlign = "center";
  loader.statusDomElement.style.width = "250px";

  document.body.appendChild( loader.statusDomElement );
  loader.showProgress = true;
  loader.load( 'models/sponza/sponza.js', callbackFinished, 'models/sponza/textures/' );

}

function callbackFinished( geometry, materials ) {

  var faceMaterial = new THREE.MeshFaceMaterial();
  faceMaterial.materials = materials;

  var mesh = new THREE.Mesh( geometry, faceMaterial );
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add( mesh );

  loader.statusDomElement.style.display = "none";
}

function initPostProcessing() {
  var composer = new THREE.EffectComposer(renderer);
  var renderPass = new THREE.RenderPass(scene, camera);
  var bokehPass = new THREE.BokehPass(scene, camera, {
    focus: 1.0,
    aperture: 0.75,
    maxblur: 0.01,
    width: WIDTH,
    height: HEIGHT
  });

  bokehPass.renderToScreen = true;

  composer.addPass( renderPass );
  composer.addPass( bokehPass );

  postprocessing.composer = composer;
  postprocessing.bokeh = bokehPass;
}

function animate() {
  controls.update(clock.getDelta());
  renderer.clear();
  requestAnimationFrame(animate);
  if (!dof.enableDoF) renderer.render(scene, camera);
  else postprocessing.composer.render( 5 );
}
