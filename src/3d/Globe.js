import React, { Component } from 'react';
// import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls';
import Clouds from '../assets/2_no_clouds_4k.jpg';
import Elevation from '../assets/elev_bump_4k.jpg';
import Water from '../assets/water_4k.png';
import fairClouds from '../assets/fair_clouds_4k.png';
import Navbar from "../components/Navbar";

class Globe extends Component {
	constructor( props ) {
		super( props );
		this.state = {};
		this.start = this.start.bind( this );
		this.stop = this.stop.bind( this );
		this.animate = this.animate.bind( this );
		this.renderScene = this.renderScene.bind( this );
		this.computeBoundingBox = this.computeBoundingBox.bind( this );
		this.setupScene = this.setupScene.bind( this );
		this.destroyContext = this.destroyContext.bind( this );
		this.handleWindowResize = this.handleWindowResize.bind( this );
		window.addEventListener( 'resize', this.handleWindowResize );
	}

	componentDidMount() {
		this.setupScene();
	}

	setupScene() {
		this.width = this.container.clientWidth;
		this.height = this.container.clientHeight;

		const renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.shadowMap.enabled = true;
		renderer.gammaOutput = true;
		renderer.gammaFactor = 2.2;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		const scene = new THREE.Scene();
		scene.background = new THREE.Color( 'black' );

		const camera = new THREE.PerspectiveCamera(
			60,
			this.width / this.height,
			0.25,
			1000
		);
		scene.add( camera );

		let sphere = new THREE.SphereGeometry( 50, 300, 300 );
		let material = new THREE.MeshPhongMaterial( {
			map: new THREE.TextureLoader().load( Clouds ),
			bumpMap: new THREE.TextureLoader().load( Elevation ),
			bumpScale: 0.005,
			specularMap: THREE.ImageUtils.loadTexture( Water ),
			specular: new THREE.Color( 'grey' ),
		} );

		let mesh = new THREE.Mesh( sphere, material );
		scene.add( mesh );
		sphere = new THREE.SphereGeometry( 50.1, 300, 300 );
		material = new THREE.MeshPhongMaterial( {
			map: new THREE.TextureLoader().load( fairClouds ),
			transparent: true,
		} );
		mesh = new THREE.Mesh( sphere, material );
		scene.add( mesh );
		this.renderer = renderer;
		this.scene = scene;
		this.camera = camera;
		this.object = mesh;

		const spotLight = new THREE.SpotLight( 0xffffff, 0.25 );
		spotLight.position.set( 45, 50, 15 );
		camera.add( spotLight );
		this.spotLight = spotLight;

		const ambLight = new THREE.AmbientLight( 0x333333 );
		ambLight.position.set( 5, 3, 5 );
		this.camera.add( ambLight );

		this.computeBoundingBox();
	}

	computeBoundingBox() {
		const offset = 1.6;
		const boundingBox = new THREE.Box3();
		boundingBox.setFromObject( this.object );
		const center = boundingBox.getCenter();
		const size = boundingBox.getSize();
		const maxDim = Math.max( size.x, size.y, size.z );
		const fov = this.camera.fov * ( Math.PI / 180 );
		let cameraZ = maxDim / 2 / Math.tan( fov / 2 );
		cameraZ *= offset;
		this.camera.position.z = center.z + cameraZ;
		const minZ = boundingBox.min.z;
		const cameraToFarEdge = minZ < 0 ? -minZ + cameraZ : cameraZ - minZ;

		this.camera.far = cameraToFarEdge * 3;
		this.camera.lookAt( center );
		this.camera.updateProjectionMatrix();

		const controls = new THREE.OrbitControls(
			this.camera,
			this.renderer.domElement
		);
		controls.enableDamping = true;
		controls.dampingFactor = 0.25;
		controls.enableZoom = false;
		controls.zoomSpeed = 0.1;
		controls.enableKeys = false;
		controls.screenSpacePanning = false;
		controls.enableRotate = true;
		controls.autoRotate = true;
		controls.dampingFactor = 1;
		controls.autoRotateSpeed = 1.2;
		controls.enablePan = false;
		controls.target.set( center.x, center.y, center.z );
		controls.update();
		this.controls = controls;
		this.renderer.setSize( this.width, this.height );
		this.container.appendChild( this.renderer.domElement );
		this.start();
	}

	start() {
		if ( ! this.frameId ) {
			this.frameId = requestAnimationFrame( this.animate );
		}
	}

	renderScene() {
		this.renderer.render( this.scene, this.camera );
	}

	animate() {
		this.frameId = requestAnimationFrame( this.animate );
		this.controls.update();
		this.renderScene();
	}

	stop() {
		cancelAnimationFrame( this.frameId );
	}

	handleWindowResize() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
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
		const width = '100%';
		const height = '100%';
		return (
			<>
				<Navbar/>
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
			</>
		);
	}
}

export default Globe;
