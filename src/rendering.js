import * as THREE from 'three';
import { polarToCartesian } from './helpers';
import OrbitControls from './OrbitControls'; // TODO

const RADIUS = 50;
let controls; // TODO

function circleFactory() {
    const segmentCount = 64;
    const radius = RADIUS;
    const geometry = new THREE.Geometry();
    const material = new THREE.LineBasicMaterial({ color: 0xFFFFFF, opacity: 0.1, transparent: true });

    for (let i = 0; i <= segmentCount; i++) {
        const theta = (i / segmentCount) * Math.PI * 2;
        geometry.vertices.push(
            new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0),
        );
    }

    return new THREE.Line(geometry, material);
}

function shipFactory() {
    const cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(0, 0.75, 2, 4),
        new THREE.MeshPhongMaterial({
            color: 0x156289,
            emissive: 0x072534,
            shading: THREE.FlatShading,
        }),
    );
    cylinder.rotation.y = Math.PI / 2;
    cylinder.scale.multiplyScalar(3);

    const container = new THREE.Object3D();
    container.add(cylinder);

    return container;
}

function coinFactory() {
    const cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, 0.5, 16),
        new THREE.MeshPhongMaterial({
            color: 0x156289,
            emissive: 0x072534,
            shading: THREE.FlatShading,
        }),
    );
    cylinder.rotation.x = Math.PI / 2;

    return cylinder;
}

function setup() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x333333, 1);
    document.body.appendChild(renderer.domElement);

    const lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    lights[0].position.set(0, 2000, 0);
    lights[1].position.set(1000, 2000, 1000);
    lights[2].position.set(-1000, -2000, -1000);

    scene.add(lights[0]);
    scene.add(lights[1]);
    scene.add(lights[2]);

    const circle = circleFactory();
    const ship = shipFactory();
    const coins = new THREE.Object3D();

    scene.add(circle);
    scene.add(ship);
    scene.add(coins);

    controls = new OrbitControls(camera, renderer.domElement); // TODO

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    return ({ state }) => {
        controls.update(); // TODO
        if (!coins.children.length) {
            state.get('coins').forEach((coin) => {
                const mesh = coinFactory();
                const position = polarToCartesian(coin.get('angle'), RADIUS);
                mesh.position.x = position.x;
                mesh.position.y = position.y;
                coins.add(mesh);
            });
        }
        for (let i = 0; i < state.get('coins').size; i++) {
            coins.children[i].visible = !state.getIn(['coins', i, 'collected']);
        }
        ship.scale.y = state.get('direction'); // TODO
        ship.rotation.z = state.get('position') + (Math.PI * 2);
        const position = polarToCartesian(state.get('position'), RADIUS);
        ship.position.x = position.x;
        ship.position.y = position.y;
        renderer.render(scene, camera);
    };
}

export default setup;
