/* jshint sub: true */
/* jshint browser: true*/
/* global THREE:true */
/* global dat: true*/
'use strict';


// main.js
var scene, camera, controls, renderer;

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

// Ground texture
var groundTexturePath = path + 'grid.png';

init();
animate();

function init() {

  var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;

  // Add a renderer to the body
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(WIDTH, HEIGHT);

  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;

  document.body.appendChild(renderer.domElement);

  // The scene
  scene = new THREE.Scene();
  // scene.fog = new THREE.Fog(0x000000, 0.1, 1000);


  //////////////////////////////////////////////////////////////////////////////
  //  CAMERA                                                                  //
  //////////////////////////////////////////////////////////////////////////////

  // Resize everything when the window resizes
  window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
  });


  //////////////////////////////////////////////////////////////////////////////
  //  SKYBOX                                                                  //
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

  scene.add(skybox);



  //////////////////////////////////////////////////////////////////////////////
  //  SCENE                                                                   //
  //////////////////////////////////////////////////////////////////////////////

  var loader = new THREE.ObjectLoader();
  loader.load(modelPath + "crytek-sponza.scene/crytek-sponza-v-ray-speed-tests-gamma.json",function ( obj ) {
  // loader.load(modelPath + "scene.json",function ( obj ) {
    scene.add(obj);
    camera = scene.getObjectByName("TurnTableCamera", true);
    setupControls(camera);
  });


  //////////////////////////////////////////////////////////////////////////////
  //  OBJECTS/GEOMETRY                                                        //
  //////////////////////////////////////////////////////////////////////////////
/*
  var geometry, material, mesh;
  var shader, uniforms;
  var texture, bumpMap;

  // The ground
  texture = THREE.ImageUtils.loadTexture(groundTexturePath);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.x = texture.repeat.y = 8;

  material = new THREE.MeshLambertMaterial({map: texture});

  geometry = new THREE.PlaneBufferGeometry(1024, 1024, 1, 1);

  mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.translateY(-2.5);
  mesh.rotateX(-90*Math.PI/180);

  scene.add(mesh);

  // Rows of objects
  material = new THREE.MeshPhongMaterial({
    color: 0x343477,
    ambient: 0x565695,
    specular: 0x8080B3,
    shininess: 20,
    shading: THREE.FlatShading
  });

  // geometry = new THREE.SphereGeometry(25, 25, 25);
  geometry = new THREE.IcosahedronGeometry(25, 1);
  // geometry = new THREE.OctahedronGeometry(25);

  var rows = 7;
  var columns = 7;
  var xSpacing = 75;
  var zSpacing = 75;
  // var xOffset = (xSpacing / rows * 2);
  // var zOffset = (zSpacing / columns * 2);
  var xOffset = -220;
  var zOffset = -50;

  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < columns; j++) {
      mesh = new THREE.Mesh(geometry, material);
      mesh.translateZ(zSpacing * i + j + zOffset);
      mesh.translateX(xSpacing * j + xOffset);
      mesh.translateY(25);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }
  }
*/

  //////////////////////////////////////////////////////////////////////////////
  //  LIGHTS                                                                  //
  //////////////////////////////////////////////////////////////////////////////

  // var directionalLight = new THREE.DirectionalLight(0xFFFBE2, 0.8);
  // directionalLight.position.set(128, 256, 128);
  // directionalLight.castShadow = true;
  // directionalLight.shadowMapWidth = 2048;
  // directionalLight.shadowMapHeight = 2048;
  //
  // var d = 512;
  //
  // directionalLight.shadowCameraLeft = -d;
  // directionalLight.shadowCameraRight = d;
  // directionalLight.shadowCameraTop = d;
  // directionalLight.shadowCameraBottom = -d;
  //
  // directionalLight.shadowCameraFar = 3500;
  // directionalLight.shadowBias = -0.0001;
  // directionalLight.shadowDarkness = 0.7;

  // directionalLight.shadowCameraVisible = true;

  // scene.add(directionalLight);

  // var hemisphereLight = new THREE.HemisphereLight(0x363636, 0x363636, 1);
  // scene.add(hemisphereLight);


  //////////////////////////////////////////////////////////////////////////////
  //  CONTROLS                                                                //
  //////////////////////////////////////////////////////////////////////////////

  function setupControls(camera) {
    controls = new THREE.FirstPersonControls(camera, renderer.domElement);
    controls.activeLook = true;
    controls.lookSpeed = 0.05;
    controls.movementSpeed = 300;
    controls.lookVertical = true;
  }

  var DepthOfField = function() {
    this.enableDoF = true;
    this.speed = 0.8;
    this.displayOutline = false;
    // this.explode = function() { ... };
    // Define render logic ...
  };

  window.onload = function() {
    var dof = new DepthOfField();
    var gui = new dat.GUI();
    gui.add(dof, 'enableDoF');
    gui.add(dof, 'speed', -5, 5);
    gui.add(dof, 'displayOutline');
    // gui.add(text, 'explode');
  };

}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
  controls.update(clock.getDelta());
}
