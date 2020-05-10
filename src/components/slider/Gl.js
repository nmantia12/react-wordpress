import { store } from './Store';

class Gl {
	constructor() {
		this.scene = new THREE.Scene();
		this.animate = this.animate.bind( this );
		this.onScrollEVent = this.onScrollEVent.bind( this );

		this.camera = new THREE.OrthographicCamera(
			store.ww / -2,
			store.ww / 2,
			store.wh / 2,
			store.wh / -2,
			1,
			10
		);
		this.camera.lookAt( this.scene.position );
		this.camera.position.z = 1;

		this.renderer = new THREE.WebGLRenderer( {
			alpha: true,
			antialias: true,
		} );
		this.renderer.setPixelRatio( 1.5 );
		this.renderer.setSize( store.ww, store.wh );
		this.renderer.setClearColor( 0xffffff, 0 );

		this.init();
	}

	start() {
		if ( ! this.frameId ) {
			this.frameId = requestAnimationFrame( this.animate );
		}
	}

	onScrollEVent( e ) {
		console.log( e );
	}

	stop() {
		cancelAnimationFrame( this.frameId );
	}

	animate() {
		this.frameId = requestAnimationFrame( this.animate );
		this.renderer.render( this.scene, this.camera );
	}

	init() {
		const domEl = this.renderer.domElement;
		domEl.classList.add( 'dom-gl' );
		document.body.appendChild( domEl );
		window.addEventListener( 'scroll', this.onScrollEVent );
		this.start();
	}
}

export default Gl;
