import { store } from './Store';
import waterNormal from '../../assets/waternormals.jpg';

class Gl {
	constructor() {
		this.scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera(90, store.ww / store.wh, 1, 2000);
		this.camera = camera;

		this.parameters = {
			distance: 400,
			inclination: 0.5,
		};

		this.renderer = new THREE.WebGLRenderer( {
			alpha: true,
			antialias: true,
		} );

		this.renderer.setPixelRatio( 1 );
		this.renderer.setSize( store.ww, store.wh );
		this.renderer.setClearColor(0x000000, 1 );
		this.init();
	}

	init() {
		const domEl = this.renderer.domElement;
		domEl.classList.add( 'dom-gl' );

		const white = new THREE.Color(0xffffff);
		const black = new THREE.Color(0x000000);
		const charcoal = new THREE.Color(0x001e0f);
		// this.scene.background = charcoal;

		const fogColor = black;
		const density = 0.001;
		this.scene.fog = new THREE.FogExp2(fogColor, density);

		var waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000);

		var water = new THREE.Water(
			waterGeometry,
			{
				textureWidth: 512,
				textureHeight: 512,
				waterNormals: new THREE.TextureLoader().load(waterNormal, function (texture) {
					texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				}),
				alpha: .8,
				sunColor: charcoal,
				waterColor: black,
				distortionScale: 3.7,
				fog: this.scene.fog !== undefined
			}
		);

		water.material.uniforms.size.value = 0.1;
		water.rotation.x = -Math.PI / 2;
		this.water = water;
		this.scene.add( water );

		// var sky = new THREE.Sky();
		// this.sky = sky;
		// this.sky.scale.setScalar( 10000 );
		// console.log(this.sky);
		// this.scene.add( sky );

		// this.sky.material.uniforms['turbidity'].value = 10;
		// this.sky.material.uniforms['rayleigh'].value = 2;
		// // this.sky.material.uniforms['luminance'].value = 1;
		// this.sky.material.uniforms['mieCoefficient'].value = 0.005;
		// this.sky.material.uniforms['mieDirectionalG'].value = 0.8;

		// var cubeCamera = new THREE.CubeCamera(0.1, 1, 512);
		// cubeCamera.renderTarget.texture.generateMipmaps = true;
		// cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;
		// this.cubeCamera = cubeCamera;

		document.body.appendChild( domEl );

	}
}

export default Gl;
