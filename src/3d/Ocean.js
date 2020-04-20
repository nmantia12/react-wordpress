import React, { Component } from 'react';
// import * as THREE from 'three';
import Stats from 'stats-js';
import { GUI } from 'dat.gui';
import 'three/examples/js/controls/OrbitControls';
import Water from 'three/examples/js/objects/Water.js';
import Sky from 'three/examples/js/objects/Sky.js';
import waterNormal from '../assets/waternormals.jpg';

class Ocean extends Component {
	constructor( props ) {
		super( props );
		this.state = {};
		this.start = this.start.bind( this );
		this.stop = this.stop.bind( this );
		this.animate = this.animate.bind( this );
		this.renderScene = this.renderScene.bind( this );
		this.computeBoundingBox = this.computeBoundingBox.bind( this );
		this.init = this.init.bind( this );
		this.updateSun = this.updateSun.bind(this);
		this.destroyContext = this.destroyContext.bind( this );
		this.onWindowResize = this.onWindowResize.bind( this );
		window.addEventListener( 'resize', this.onWindowResize, false );
	}

	componentDidMount() {
		this.init();
	}

	init() {
		this.width = this.container.clientWidth;
		this.height = this.container.clientHeight;

		var renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( this.width, this.height );
		this.renderer = renderer;
		this.container.appendChild( this.renderer.domElement );

		var scene = new THREE.Scene();

		var camera = new THREE.PerspectiveCamera( 55, this.width / this.height, 1, 20000 );
		camera.position.set( 30, 30, 100 );
		this.camera = camera;

		var light = new THREE.DirectionalLight( 0xffffff, 0.8 );
		this.light = light;
		scene.add( light );

		var waterGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );

		var water = new THREE.Water(
			waterGeometry,
			{
				textureWidth: 512,
				textureHeight: 512,
				waterNormals: new THREE.TextureLoader().load( waterNormal, function ( texture ) {

					texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

				} ),
				alpha: 1.0,
				sunDirection: this.light.position.clone().normalize(),
				sunColor: 0xffffff,
				waterColor: 0x001e0f,
				distortionScale: 3.7,
				fog: scene.fog !== undefined
			}
		);

		water.rotation.x = - Math.PI / 2;
		this.water = water;
		scene.add( this.water );

		var sky = new THREE.Sky();
		this.sky = sky;

		var uniforms = this.sky.material.uniforms;

		uniforms[ 'turbidity' ].value = 10;
		uniforms[ 'rayleigh' ].value = 2;
		uniforms[ 'luminance' ].value = 1;
		uniforms[ 'mieCoefficient' ].value = 0.005;
		uniforms[ 'mieDirectionalG' ].value = 0.8;

		var parameters = {
			distance: 400,
			inclination: 0.49,
			azimuth: 0.205
		};

		this.parameters = parameters;

		var cubeCamera = new THREE.CubeCamera( 0.1, 1, 512 );
		cubeCamera.renderTarget.texture.generateMipmaps = true;
		cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;

		this.cubeCamera = cubeCamera;
		scene.background = cubeCamera.renderTarget;

		this.updateSun();

		let geometry = new THREE.IcosahedronBufferGeometry( 20, 1 );
		var count = geometry.attributes.position.count;
		var colors = [];
		var color = new THREE.Color();

		for ( var i = 0; i < count; i += 3 ) {
			color.setHex( Math.random() * 0xffffff );
			colors.push( color.r, color.g, color.b );
			colors.push( color.r, color.g, color.b );
			colors.push( color.r, color.g, color.b );
		}
		this.colors = colors;

		geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( this.colors, 3 ) );

		var material = new THREE.MeshStandardMaterial( {
			vertexColors: true,
			roughness: 0.0,
			flatShading: true,
			envMap: cubeCamera.renderTarget.texture,
			side: THREE.DoubleSide
		} );

		var sphere = new THREE.Mesh( geometry, material );
		scene.add( sphere );
		this.sphere = sphere;
		this.scene = scene;

		//

		var controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.maxPolarAngle = Math.PI * 0.495;
		controls.target.set( 0, 10, 0 );
		controls.minDistance = 40.0;
		controls.maxDistance = 200.0;
		controls.update();
		this.controls = controls;

		//

		var stats = new Stats();
		this.stats = stats;
		this.container.appendChild( this.stats.dom );

		// GUI
		var gui = new GUI();
		var folder = gui.addFolder( 'Sky' );
		folder.add( parameters, 'inclination', 0, 0.5, 0.0001 ).onChange( this.updateSun );
		folder.add( parameters, 'azimuth', 0, 1, 0.0001 ).onChange( this.updateSun );
		folder.open();

		var uniforms = water.material.uniforms;

		var folder = gui.addFolder( 'Water' );
		folder.add( uniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
		folder.add( uniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
		folder.add( uniforms.alpha, 'value', 0.9, 1, .001 ).name( 'alpha' );
		folder.open();

		this.start();
	}

	updateSun() {
		var theta = Math.PI * ( this.parameters.inclination - 0.5 );
		var phi = 2 * Math.PI * ( this.parameters.azimuth - 0.5 );

		this.light.position.x = this.parameters.distance * Math.cos( phi );
		this.light.position.y = this.parameters.distance * Math.sin( phi ) * Math.sin( theta );
		this.light.position.z = this.parameters.distance * Math.sin( phi ) * Math.cos( theta );

		this.sky.material.uniforms[ 'sunPosition' ].value = this.light.position.copy( this.light.position );
		this.water.material.uniforms[ 'sunDirection' ].value.copy( this.light.position ).normalize();

		this.cubeCamera.update( this.renderer, this.sky );

	}

	computeBoundingBox() {

	}

	start() {
		if ( ! this.frameId ) {
			this.frameId = requestAnimationFrame( this.animate );
		}
	}

	renderScene() {
		var time = performance.now() * 0.001;
		this.sphere.position.y = Math.sin( time ) * 20 + 5;
		this.sphere.rotation.x = time * 0.5;
		this.sphere.rotation.z = time * 0.51;
		this.water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
		this.renderer.render( this.scene, this.camera );
	}

	animate() {
		this.frameId = requestAnimationFrame( this.animate );
		this.renderScene();
		this.stats.update();
	}

	stop() {
		cancelAnimationFrame( this.frameId );
	}

	onWindowResize() {
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( this.width / this.height );
	}

	componentWillUnmount() {
		this.stop();
		this.destroyContext();
	}

	destroyContext() {
		this.container.removeChild( this.renderer.domElement );
		this.renderer.forceContextLoss();
		this.renderer.context = null;
		this.renderer.domElement = null;
		this.renderer = null;
	}

	render() {
		var width = '100%';
		var height = '100%';
		return (
			<div
				ref={ ( container ) => {
					this.container = container;
				} }
				style={ {
					width: width,
					height: height,
					position: 'absolute',
					overflow: 'hidden',
				} }
			></div>
		);
	}
}

export default Ocean;
