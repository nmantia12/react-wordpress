import { store } from './Store';
import { vertexShader, fragmentShader } from './Shaders';

const loader = new THREE.TextureLoader();
loader.crossOrigin = 'anonymous';

class GlObject extends THREE.Object3D {
	init( el ) {
		this.el = el;
		this.resize();
	}

	resize() {
		this.rect = this.el.getBoundingClientRect();
		const { left, top, width, height } = this.rect;

		this.pos = {
			x: left + width / 2 - store.ww / 2,
			y: top + height / 2 - store.wh / 2,
		};

		this.position.y = this.pos.y;
		this.position.x = this.pos.x;

		this.updateX();
	}

	updateX( current ) {
		current && ( this.position.x = current + this.pos.x );
	}
}

const planeGeo = new THREE.PlaneBufferGeometry( 1, 1, 32, 32 );
const planeMat = new THREE.ShaderMaterial( {
	transparent: true,
	fragmentShader,
	vertexShader,
} );

class Plane extends GlObject {
	init( el, gl ) {
		super.init( el, gl );

		this.geo = planeGeo;
		this.mat = planeMat.clone();

		this.mat.uniforms = {
			uTime: { value: 0 },
			uTexture: { value: 0 },
			uMeshSize: {
				value: new THREE.Vector2( this.rect.width, this.rect.height ),
			},
			uImageSize: { value: new THREE.Vector2( 0, 0 ) },
			uScale: { value: 0.75 },
			uVelo: { value: 0 },
		};

		this.img = this.el.querySelector( 'img' );
		this.texture = loader.load( this.img.src, ( texture ) => {
			texture.minFilter = THREE.LinearFilter;
			texture.generateMipmaps = false;

			this.mat.uniforms.uTexture.value = texture;
			this.mat.uniforms.uImageSize.value = [
				this.img.naturalWidth,
				this.img.naturalHeight,
			];
		} );

		this.mesh = new THREE.Mesh( this.geo, this.mat );
		this.mesh.scale.set( this.rect.width, this.rect.height, 1 );
		this.add( this.mesh );
		gl.scene.add( this );
	}
}

export default Plane;
