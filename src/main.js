import * as THREE from 'three';

import {
  RollerCoasterGeometry,
  RollerCoasterShadowGeometry,
  RollerCoasterLiftersGeometry,
  TreesGeometry,
} from 'three/examples/jsm/misc/RollerCoaster.js';

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0ff);

var light = new THREE.HemisphereLight(0xfff0f0, 0x606066);
light.position.set(1, 1, 1);
scene.add(light);

var train = new THREE.Object3D();
scene.add(train);

const maxVelocity = 0.00008;

var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
train.add(camera);

// environment

var geometry = new THREE.PlaneBufferGeometry(500, 500, 15, 15);
geometry.rotateX(- Math.PI / 2);

var positions = geometry.attributes.position.array;
var vertex = new THREE.Vector3();

for (var i = 0; i < positions.length; i += 3) {

  vertex.fromArray(positions, i);

  vertex.x += Math.random() * 10 - 5;
  vertex.z += Math.random() * 10 - 5;

  var distance = (vertex.distanceTo(scene.position) / 5) - 25;
  vertex.y = Math.random() * Math.max(0, distance);

  vertex.toArray(positions, i);

}

geometry.computeVertexNormals();

var material = new THREE.MeshLambertMaterial({
  color: 0x407000
});

var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

var geometry = new TreesGeometry(mesh);
var material = new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide, vertexColors: true
});
var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

var PI = Math.PI;
var PI2 = Math.PI * 2;
var cos = Math.cos;
var sin = Math.sin;

const h1 = 100;
const h2 = 70;
const h3 = 90;
const h4 = 85;

const t1 = 10;
const t2 = 15;
const t3 = 5;
const t4 = 20;
const t5 = 10;
const t6 = 20;
const totalTime = t1 + t2 + t3 + t4 + t5 + t6;

var x1, x2, x3, x4, x5, x6;
var y1, y2, y3, y4, y5, y6;
var z1, z2, z3, z4, z5, z6;

var curve = (function () {

  var vector = new THREE.Vector3();
  var vector2 = new THREE.Vector3();

  return {

    getPointAt: function (t) {
      t = t * totalTime;

      if (t <= t1) {
        var x = t * 2;
        x1 = x;
        var y = 10 * t;
        var z = 0;
      }
      else if (t <= t1 + t2) {
        t = t - t1;
        var theta = 5.5 * PI * (t2 - t) / t2 + 4 * PI
        var r = 1.14 ** theta
        var x = r * cos(theta) + x1;
        x2 = x;
        var y = t / t2 * (h2 - h1) + h1;
        var z = -r * sin(theta);
      }
      else if (t <= t1 + t2 + t3) {
        t = t - t1 - t2;
        var theta = 2 * PI * t / t3;
        var r = (h3 - h2) * sin(theta);
        var x = r * cos(theta) + x2;
        x3 = x;
        var y = -r * sin(theta) + h2;
        var z = -10 * t / t3;
        z3 = z;
      }
      else if (t <= t1 + t2 + t3 + t4) {
        t = t - t1 - t2 - t3;
        var theta = t / t4 * 2 * PI * 3;
        var x = theta;
        x4 = x;
        var y = sin(1 / 4 * theta) * (h4 - h2) + h2;
        var z = z3;
      } else if (t <= t1 + t2 + t3 + t4 + t5) {
        t = t - t1 - t2 - t3 - t4;
        var x = -t * (t - 10) / 3 + x4;
        x5 = x;
        var y = 3 * -t * (t - 10) / 3 + h2;
        y5 = y;
        var z = z3 - (1 / (t - t5));
        z5 = z;
      } else if (t <= t1 + t2 + t3 + t4 + t5 + t6) {
        t = t - t1 - t2 - t3 - t4 - t5;
        var x = t + x5;
        x6 = x;
        var y = -Math.max(t / 5, 0) + y5;
        y6 = y;
        var z = z5;
        z6 = z;
      }

      return vector.set(x, y, z).multiplyScalar(2);

    },

    getTangentAt: function (t) {
      var scaledT = t * totalTime;
      // console.log("scaled t: ", scaledT);

      if (scaledT <= t1) {
        return new THREE.Vector3(1, 5, 1000).normalize();
      } else {
        var delta = 0.0001;
        var sectionT1 = Math.max(0, t - delta);
        var sectionT2 = Math.min(1, t + delta);

        var tangent = vector2.copy(this.getPointAt(sectionT2))
          .sub(this.getPointAt(sectionT1)).normalize();

        if (scaledT > t1 + t2 + t3 && scaledT <= t1 + t2 + t3 + t4) {
          tangent.z = 10000;
        }
        return tangent;
      }
    }

  };

})();

var geometry = new RollerCoasterGeometry(curve, 1500);
var material = new THREE.MeshPhongMaterial({
  vertexColors: true
});
var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

var geometry = new RollerCoasterLiftersGeometry(curve, 100);
var material = new THREE.MeshPhongMaterial();
var mesh = new THREE.Mesh(geometry, material);
mesh.position.y = 0.1;
scene.add(mesh);

var geometry = new RollerCoasterShadowGeometry(curve, 500);
var material = new THREE.MeshBasicMaterial({
  color: 0x305000, depthWrite: false, transparent: true
});
var mesh = new THREE.Mesh(geometry, material);
mesh.position.y = 0.1;
scene.add(mesh);

var funfairs = [];

var geometry = new THREE.CylinderBufferGeometry(10, 10, 5, 15);
var material = new THREE.MeshLambertMaterial({
  color: 0xff8080,
});
var mesh = new THREE.Mesh(geometry, material);
mesh.position.set(- 80, 10, - 70);
mesh.rotation.x = Math.PI / 2;
scene.add(mesh);

funfairs.push(mesh);

var geometry = new THREE.CylinderBufferGeometry(5, 6, 4, 10);
var material = new THREE.MeshLambertMaterial({
  color: 0x8080ff,
});
var mesh = new THREE.Mesh(geometry, material);
mesh.position.set(50, 2, 30);
scene.add(mesh);

funfairs.push(mesh);

window.addEventListener('resize', onWindowResize, false);


function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

var position = new THREE.Vector3();
var tangent = new THREE.Vector3();

var lookAt = new THREE.Vector3();

var velocity = 0;
var progress = 0;

var prevTime = performance.now();

var isCameraResetted = false;

function render() {

  var time = performance.now();
  var delta = time - prevTime;

  for (var i = 0; i < funfairs.length; i++) {

    funfairs[i].rotation.y = time * 0.0004;

  }

  progress += velocity;
  progress = progress % 1;

  position.copy(curve.getPointAt(progress));
  position.y += 0.3;

  train.position.copy(position);

  tangent.copy(curve.getTangentAt(progress));

  velocity -= tangent.y * 0.0000001 * delta;
  velocity = Math.max(maxVelocity, Math.min(0.0002, velocity));

  train.lookAt(lookAt.copy(position).sub(tangent));
  if (progress * totalTime <= t1) {
    camera.rotation.x = -PI / 2;
    camera.rotation.z = -PI / 4;
  } else if (!isCameraResetted) {
    camera.rotation.x = 0;
    camera.rotation.y = 0;
    camera.rotation.z = 0;
    isCameraResetted = true;
  }
  renderer.render(scene, camera);

  prevTime = time;

}

document.addEventListener("keydown", function (event) {
  if (event.key === " ") {
    camera.rotation.x = 0;
    camera.rotation.y = 0;
    camera.rotation.z = 0;
    return;
  }
  const delta = PI / 50;
  if (event.key === "ArrowLeft") {
    camera.rotation.y += delta
  } else if (event.key === "ArrowRight") {
    camera.rotation.y -= delta;
  } else if (event.key === "ArrowUp") {
    maxVelocity += 0.00008;
  } else if (event.key === "ArrowDown") {
    maxVelocity -= 0.00008;
    console.log(maxVelocity);
  }
});

renderer.setAnimationLoop(render);