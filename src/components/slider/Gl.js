import { store } from './Store';
import { Interaction } from 'three.interaction';

class Gl {
	constructor() {
		this.scene = new THREE.Scene();
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

		this.renderer.setPixelRatio( 1 );
		this.renderer.setSize( store.ww, store.wh );
		this.renderer.setClearColor( 0xffffff, 0 );
		this.init();
	}

	init() {
		const domEl = this.renderer.domElement;
		domEl.classList.add( 'dom-gl' );
		document.body.appendChild( domEl );
	}
}

export default Gl;
