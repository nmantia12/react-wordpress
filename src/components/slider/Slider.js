import React, { Component } from 'react';
import gsap from 'gsap';
import { vertexShader, fragmentShader } from './Shaders';
import { store } from './Store';
import axios from 'axios';
import Spinner from '../../loader.gif';
import FeaturedImage from '../layouts/FeaturedImage';
import renderHTML from 'react-render-html';
import Moment from 'react-moment';
import { Link } from '@reach/router';
import clientConfig from '../../client-config';

const loader = new THREE.TextureLoader();
loader.crossOrigin = 'anonymous';

class Gl {
	constructor() {
		this.scene = new THREE.Scene();
		this.animate = this.animate.bind( this );

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
		this.start();
	}
}

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

class Slider extends Component {
	constructor( props ) {
		super( props );
		this.bindAll();

		this.el = React.createRef();

		// this.onScroll = this.onScroll.bind( this );
		// window.addEventListener( 'scroll', this.onScroll );

		this.opts = {
			speed: 2,
			threshold: 50,
			ease: 0.035,
		};

		this.animate = this.animate.bind( this );

		this.state = {
			loading: false,
			posts: [],
			error: '',
			target: 0,
			current: 0,
			currentRounded: 0,
			y: 0,
			on: {
				x: 0,
				y: 0,
			},
			off: 0,
			progress: 0,
			diff: 0,
			max: 0,
			min: 0,
			snap: {
				points: [],
			},
			flags: {
				dragging: false,
			},
		};

		this.items = [];

		this.events = {
			move: store.isDevice ? 'touchmove' : 'mousemove',
			up: store.isDevice ? 'touchend' : 'mouseup',
			down: store.isDevice ? 'touchstart' : 'mousedown',
		};

		// this.onWindowResize = this.onWindowResize.bind( this );
		// window.addEventListener( 'resize', this.onWindowResize );
	}

	createMarkup = ( data ) => ( {
		__html: data,
	} );

	onWindowResize() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		this.gl.camera.aspect = width / height;
		this.gl.camera.updateProjectionMatrix();
		// this.gl.renderer.setPixelRatio( 1.5 );
		this.gl.renderer.setSize( width, height );
	}

	componentDidMount() {
		const wordPressSiteURL = clientConfig.siteUrl;
		this._isMounted = true;

		if ( this._isMounted ) {
			this.setState( { loading: true }, () => {
				axios
					.get(
						`${ wordPressSiteURL }/wp-json/wp/v2/portfolio?_embed&per_page=9`
					)
					.then( ( res ) => {
						if ( 200 === res.status ) {
							if ( res.data.length && this._isMounted ) {
								this.setState( {
									loading: false,
									posts: res.data,
								} );

								this.gl = new Gl();

								this.ui = {
									items: this.el.current.querySelectorAll(
										'.js-slide'
									),
									titles: document.querySelectorAll(
										'.js-title'
									),
									lines: document.querySelectorAll(
										'.js-progress-line'
									),
								};

								this.init();
							} else if ( this._isMounted ) {
								this.setState( {
									loading: false,
									error: 'No Posts Found',
								} );
							}
						}
					} )
					.catch( ( err ) => {
						if ( this._isMounted ) {
							console.log( err );
							this.setState( { loading: false, error: err } );
						}
					} );
			} );
		}
	}

	componentWillUnmount() {
		this._isMounted = false;
		this.stop();
		this.destroy();
		document.body.removeChild( this.gl.renderer.domElement );
		this.gl.renderer.forceContextLoss();
		this.gl.renderer.context = null;
		this.gl.renderer.domElement = null;
		this.gl.renderer = null;
		this.gl.stop();
	}

	bindAll() {
		[ 'onDown', 'onMove', 'onUp' ].forEach(
			( fn ) => ( this[ fn ] = this[ fn ].bind( this ) )
		);
	}

	init() {
		return gsap.utils.pipe( this.setup(), this.on() );
	}

	destroy() {
		this.off();
		this.state = null;
		this.items = null;
		this.opts = null;
		this.ui = null;
	}

	on() {
		const { move, up, down } = this.events;
		window.addEventListener( down, this.onDown );
		window.addEventListener( move, this.onMove );
		window.addEventListener( up, this.onUp );
		this.start();
	}

	off() {
		const { move, up, down } = this.events;

		window.removeEventListener( down, this.onDown );
		window.removeEventListener( move, this.onMove );
		window.removeEventListener( up, this.onUp );
	}

	setup() {
		const { ww } = store;
		const state = this.state;
		const { items, titles } = this.ui;

		const {
			width: wrapWidth,
			left: wrapDiff,
		} = this.el.current.getBoundingClientRect();

		if ( this._isMounted ) {
			// Set bounding
			state.max = -(
				items[ items.length - 1 ].getBoundingClientRect().right -
				wrapWidth -
				wrapDiff
			);
			state.min = 0;
		}

		// Global timeline
		this.tl = gsap
			.timeline( {
				paused: true,
				defaults: {
					duration: 1,
					ease: 'linear',
				},
			} )
			.fromTo(
				'.js-progress-line-2',
				{
					scaleX: 1,
				},
				{
					scaleX: 0,
					duration: 0.5,
					ease: 'power3',
				},
				0
			)
			.fromTo(
				'.js-titles',
				{
					yPercent: 0,
				},
				{
					yPercent: -( 100 - 100 / titles.length ),
				},
				0
			)
			.fromTo(
				'.js-progress-line',
				{
					scaleX: 0,
				},
				{
					scaleX: 1,
				},
				0
			);

		// Cache stuff
		for ( let i = 0; i < items.length; i++ ) {
			const el = items[ i ];
			const { left, right, width } = el.getBoundingClientRect();

			// Create webgl plane
			const plane = new Plane();
			plane.init( el, this.gl );
			this.plane = plane;

			// Timeline that plays when visible
			const tl = gsap.timeline( { paused: true } ).fromTo(
				plane.mat.uniforms.uScale,
				{
					value: 0.65,
				},
				{
					value: 1,
					duration: 1,
					ease: 'linear',
				}
			);

			// Push to cache
			this.items.push( {
				el,
				plane,
				left,
				right,
				width,
				min: left < ww ? ww * 0.775 : -( ww * 0.225 - wrapWidth * 0.2 ),
				max:
					left > ww
						? state.max - ww * 0.775
						: state.max + ( ww * 0.225 - wrapWidth * 0.2 ),
				tl,
				out: false,
			} );
		}
	}

	calc() {
		const state = this.state;
		state.current += ( state.target - state.current ) * this.opts.ease;
		state.currentRounded = ( state.current * 100 ) / 100;
		state.diff = ( state.target - state.current ) * 0.0005;
		const { items } = this.ui;
		const {
			width: wrapWidth,
			left: wrapDiff,
		} = this.el.current.getBoundingClientRect();

		state.progress = gsap.utils.wrap(
			0,
			1,
			state.currentRounded /
				Math.round(
					state.max +
						( state.max * ( 1 / items.length ) -
							wrapWidth * ( 1 / items.length ) -
							wrapDiff * ( 1 / items.length ) )
				)
		);

		this.tl && this.tl.progress( state.progress );
	}

	start() {
		if ( ! this.frameId ) {
			this.frameId = requestAnimationFrame( this.animate );
		}
	}

	stop() {
		cancelAnimationFrame( this.frameId );
	}

	animate() {
		this.frameId = requestAnimationFrame( this.animate );
		this.calc();
		this.transformItems();
	}

	transformItems() {
		const { flags } = this.state;

		for ( let i = 0; i < this.items.length; i++ ) {
			const item = this.items[ i ];
			const { translate, isVisible, progress } = this.isVisible( item );

			item.plane.updateX( translate );
			item.plane.mat.uniforms.uVelo.value = this.state.diff;

			if ( ! item.out && item.tl ) {
				item.tl.progress( progress );
			}

			if ( isVisible || flags.resize ) {
				item.out = false;
			} else if ( ! item.out ) {
				item.out = true;
			}
		}
	}

	isVisible( { left, right, width, min, max } ) {
		const { ww } = store;
		const { currentRounded } = this.state;
		const translate = gsap.utils.wrap( min, max, currentRounded );
		const threshold = this.opts.threshold;
		const start = left + translate;
		const end = right + translate;
		const isVisible = start < threshold + ww && end > -threshold;
		const progress = gsap.utils.clamp(
			0,
			1,
			1 - ( translate + left + width ) / ( ww + width )
		);

		return {
			translate,
			isVisible,
			progress,
		};
	}

	clampTarget() {
		const state = this.state;

		state.target = gsap.utils.clamp( state.max, 0, state.target );
	}

	getPos( { changedTouches, clientX, clientY, target } ) {
		const x = changedTouches ? changedTouches[ 0 ].clientX : clientX;
		const y = changedTouches ? changedTouches[ 0 ].clientY : clientY;

		return {
			x,
			y,
			target,
		};
	}

	onDown( e ) {
		const { x, y } = this.getPos( e );
		const { flags, on } = this.state;

		flags.dragging = true;
		on.x = x;
		on.y = y;
	}

	onUp() {
		const state = this.state;

		state.flags.dragging = false;
		state.off = state.target;
	}

	onScroll( e ) {
		console.log( 'something' );
		const { x, y } = this.getPos( e );
		const state = this.state;

		// if (!state.flags.dragging) return;

		const { off, on } = state;
		const moveX = x - on.x;
		const moveY = y - on.y;

		if ( Math.abs( moveX ) > Math.abs( moveY ) && e.cancelable ) {
			e.preventDefault();
			e.stopPropagation();
		}

		state.target = off + moveX * this.opts.speed;
	}

	onMove( e ) {
		const { x, y } = this.getPos( e );
		const state = this.state;

		if ( ! state.flags.dragging ) return;

		const { off, on } = state;
		const moveX = x - on.x;
		const moveY = y - on.y;

		if ( Math.abs( moveX ) > Math.abs( moveY ) && e.cancelable ) {
			e.preventDefault();
			e.stopPropagation();
		}

		state.target = off + moveX * this.opts.speed;
	}

	render() {
		const { loading, posts, error } = this.state;

		return (
			<React.Fragment>
				{ error && (
					<div
						className="alert alert-danger"
						dangerouslySetInnerHTML={ this.createMarkup( error ) }
					/>
				) }
				{ this._isMounted && posts.length ? (
					<div className="slider-wrap">
						<div className="slider | js-drag-area">
							<div
								className="slider__inner | js-slider"
								ref={ this.el }
							>
								{ posts.map( ( post, index ) => (
									<div
										className="slide | js-slide"
										key={ index }
										style={ {
											left: index * 120 + '%',
										} }
									>
										<div className="slide__inner | js-slide__inner">
											<img
												className="js-slide__img"
												src={
													post.better_featured_image &&
													post.better_featured_image
														? post
																.better_featured_image
																.source_url
														: 'http://localhost:9001/wp/wp-content/uploads/2020/05/d18f47ff-3adf-3948-b3d0-2d451da90866.png'
												}
												alt=""
												crossOrigin="anonymous"
												draggable="false"
											/>
										</div>
									</div>
								) ) }
							</div>
						</div>

						<div className="titles">
							<div className="titles__title titles__title--proxy">
								Lorem ipsum
							</div>
							<div className="titles__list | js-titles">
								{ posts.map( ( post, index ) => (
									<div
										key={ index }
										className="titles__title | js-title"
									>
										{ post.title.rendered }
									</div>
								) ) }
								<div className="titles__title | js-title">
									{ posts[ '0' ].title.rendered }
								</div>
							</div>
						</div>

						<div className="progress">
							<div className="progress__line | js-progress-line"></div>
							<div className="progress__line | js-progress-line-2"></div>
						</div>
					</div>
				) : (
					''
				) }
				{ loading && (
					<img className="loader" src={ Spinner } alt="Loader" />
				) }
			</React.Fragment>
		);
	}
}

export default Slider;
