/* eslint-disable no-console */
import React, { Component } from 'react';
import { gsap, Power0 } from 'gsap';
import axios from 'axios';
import Spinner from '../../loader.gif';
import DefaultImg from '../../default.png';
// import FeaturedImage from '../layouts/FeaturedImage';
// import renderHTML from 'react-render-html';
// import Moment from 'react-moment';
// import { Link } from '@reach/router';
import clientConfig from '../../client-config';
import { store } from './Store';
import { vertexShader, fragmentShader } from './Shaders';
import { TweenLite } from 'gsap';
import Gl from './Gl';

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
			x: left + width / 2 - window.innerWidth / 2,
			y: top + height / 2 - window.innerHeight / 2,
		};

		this.position.y = this.pos.y;
		this.position.x = this.pos.x;

		this.updateX();
	}

	updateX( current ) {
		current && ( this.position.x = current + this.pos.x );
	}
}

const segments = 128;
const geometry = new THREE.PlaneBufferGeometry( 1, 1, segments, segments );
const planeMat = new THREE.ShaderMaterial( {
	transparent: true,
	fragmentShader,
	vertexShader,
} );

class Plane extends GlObject {
	init( el, gl ) {
		super.init( el, gl );
		this.gl = gl;
		this.geo = geometry;
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
		this.mesh.position.set(0, (this.rect.height / 2) + 15, 557 );
		this.gl.camera.position.set(0, (this.rect.height / 2), 1000);

		this.add( this.mesh );
		this.gl.scene.add( this );

		this.onWindowResize = this.onWindowResize.bind( this );
		window.addEventListener( 'resize', this.onWindowResize );
	}

	onWindowResize() {
		this.resize();
		this.mesh.scale.set( this.rect.width, this.rect.height, 1 );
	}
}

const _getClosest = ( item, array, getDiff ) => {
	let closest, diff;

	if ( ! Array.isArray( array ) ) {
		throw new Error( 'Get closest expects an array as second argument' );
	}

	array.forEach( function( comparedItem, comparedItemIndex ) {
		const thisDiff = getDiff( comparedItem, item );

		if (
			thisDiff >= 0 &&
			( typeof diff === 'undefined' || thisDiff < diff )
		) {
			diff = thisDiff;
			closest = comparedItemIndex;
		}
	} );

	return closest;
};

const number = ( item, array ) => {
	return _getClosest( item, array, function( comparedItem, item ) {
		return Math.abs( comparedItem - item );
	} );
};

class Slider extends Component {
	constructor( props ) {
		super( props );
		this.bindAll();
		this.gl = new Gl();
		this.el = React.createRef();

		this.opts = {
			speed: 2,
			threshold: 50,
			ease: 0.075,
		};

		this.animate = this.animate.bind( this );

		this.state = {
			loading: false,
			bgColor: '#111',
			textColor: '#fff',
			posts: [],
			colors: [],
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

		this.colors = [];
		this.titleColors = [];
		this.items = [];

		this.events = {
			move: store.isDevice ? 'touchmove' : 'mousemove',
			up: store.isDevice ? 'touchend' : 'mouseup',
			down: store.isDevice ? 'touchstart' : 'mousedown',
		};

		this.onWindowResize = this.onWindowResize.bind( this );
	}

	createMarkup = ( data ) => ( {
		__html: data,
	} );

	onWindowResize() {
		// this.gl.camera.left = window.innerWidth / -2;
		// this.gl.camera.right = window.innerWidth / 2;
		// this.gl.camera.top = window.innerHeight / 2;
		this.gl.camera.aspect = window.innerWidth / window.innerHeight;
		this.gl.camera.updateProjectionMatrix();
		this.gl.renderer.setSize( window.innerWidth, window.innerHeight );

		this.setBounds();
		this.updateCache();
		this.start();
		this.calc();
		this.transformItems();
		this.onUp();
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
	}

	bindAll() {
		[ 'onDown', 'onMove', 'onUp' ].forEach(
			( fn ) => ( this[ fn ] = this[ fn ].bind( this ) )
		);
	}

	init() {
		gsap.utils.pipe( this.setup(), this.on() );
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

		window.addEventListener( 'resize', this.onWindowResize );
		window.addEventListener( down, this.onDown );
		window.addEventListener( move, this.onMove );
		window.addEventListener( up, this.onUp );
		this.start();

		var theta = Math.PI * (this.gl.parameters.inclination - 0.5);
		var phi = 2 * Math.PI * - 0.5;
		this.updateSun(phi, theta);
	}

	off() {
		const { move, up, down } = this.events;

		window.removeEventListener( down, this.onDown );
		window.removeEventListener( move, this.onMove );
		window.removeEventListener( up, this.onUp );
		window.removeEventListener( 'resize', this.onWindowResize );
	}

	setBounds() {
		const state = this.state;
		const { items } = this.ui;
		const {
			width: wrapWidth,
			left: wrapDiff,
		} = this.el.current.getBoundingClientRect();

		// Set bounding
		state.max = -(
			items[ items.length - 1 ].getBoundingClientRect().right -
			wrapWidth -
			wrapDiff
		);
	}

	updateCache() {
		const state = this.state;
		const { items } = this.ui;
		const {
			width: wrapWidth,
			left: wrapDiff,
		} = this.el.current.getBoundingClientRect();

		// Cache stuff
		for ( let i = 0; i < items.length; i++ ) {
			const el = items[ i ];
			const { left, right, width } = el.getBoundingClientRect();

			// Push to cache
			this.items[i].left = left;
			this.items[i].right = right;
			this.items[i].width = width;
			this.items[i].min = window.innerWidth * 0.775;
			this.items[i].max = state.max - window.innerWidth * 0.775;

		}
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
			this.setBounds();
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
					yPercent: -100,
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
			el.plane = plane;
			plane.init( el, this.gl );

			// Timeline that plays when visible
			const tl = gsap.timeline( { paused: true } ).fromTo(
				plane.mat.uniforms.uScale,
				{
					value: 0.15,
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
				min: ww * 0.775,
				max: state.max - ww * 0.775,
				tl,
				out: false,
			} );
		}
	}

	calc() {
		const state = this.state;
		state.current += ( state.target - state.current ) * this.opts.ease;
		state.currentRounded = ( state.current * 100 ) / 100;
		state.diff = ( state.target - state.current ) * 0.00125;

		const { items } = this.ui;
		const {
			width: wrapWidth,
			left: wrapDiff,
		} = this.el.current.getBoundingClientRect();

		state.progress = gsap.utils.clamp(
			0,
			1,
			state.currentRounded /
				Math.round(
					state.max +
						( state.max * ( 1 / items.length ) -
							wrapWidth * ( 1 / items.length ) -
						wrapDiff * (1 / items.length) )
			)
		);

		// update sun
		var theta = Math.PI * (this.gl.parameters.inclination - 0.5);
		var phi = 2 * Math.PI * (((state.progress * 1.2) / 2) - 0.5);
		this.updateSun(phi, theta);

		this.tl && this.tl.progress(state.progress);
	}

	start() {
		if ( ! this.frameId ) {
			this.frameId = requestAnimationFrame( this.animate );
		}
	}

	stop() {
		this.frameId = cancelAnimationFrame( this.frameId );
	}

	animate() {
		this.frameId = requestAnimationFrame( this.animate );
		this.gl.water.material.uniforms['time'].value += 1.0 / 60.0;
		this.gl.renderer.render(this.gl.scene, this.gl.camera);
		this.calc();
		this.transformItems();
	}

	transformItems() {
		const { flags, colors, titleColors } = this.state;

		for ( let i = 0; i < this.items.length; i++ ) {
			const item = this.items[ i ];
			const { translate, isVisible, progress } = this.isVisible( item );

			item.plane.updateX(translate);
			item.plane.mat.uniforms.uVelo.value = this.state.diff;

			if ( ! item.out && item.tl ) {
				item.tl.progress( progress );
			}

			if ( isVisible || flags.resize ) {
				item.out = false;
			} else if ( ! item.out ) {
				item.out = true;
			}

			// if ( flags.dragging == false && ( Math.round( translate ) == Math.round( this.state.target ) ) ) {
			// 	setTimeout(() => {
			// 		this.stop();
			// 	}, 500 );
			// }
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
		const { closest } = this.closest();
		state.target = gsap.utils.clamp( state.max, state.min, closest );
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

	closest() {
		const numbers = [];

		this.items.forEach( ( slide, index ) => {
			const center = slide.left + slide.width / 2;
			const fromCenter = window.innerWidth / 2 - center;
			numbers.push( fromCenter );
		} );

		if ( this.state.target <= this.state.max ) {
			const wrap = gsap.utils.wrap(
				this.state.min,
				this.state.max,
				this.state.target
			);
			this.state.target = wrap + this.state.max;
		}

		let closest = number( this.state.target, numbers );
		closest = numbers[ closest ];

		return {
			closest,
		};
	}

	updateSun(phi, theta) {
		// this.gl.light.position.x = this.gl.parameters.distance * Math.cos(phi);
		// this.gl.light.position.y = this.gl.parameters.distance * Math.sin(phi) * Math.sin(theta);
		// this.gl.light.position.z = this.gl.parameters.distance * Math.sin(phi) * Math.cos(theta);

		// this.gl.sky.material.uniforms['sunPosition'].value = this.gl.light.position.copy(this.gl.light.position);
		// this.gl.water.material.uniforms['sunDirection'].value.copy(this.gl.light.position).normalize();

		// this.gl.cubeCamera.update(this.gl.renderer, this.gl.sky);

	}

	onUp() {
		const state = this.state;
		state.flags.dragging = false;
		this.clampTarget();
		state.off = state.target;
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
		const {
			loading,
			posts,
			error,
			colors,
			bgColor,
			textColor,
		} = this.state;

		return (
			<React.Fragment>
				{ error && (
					<div
						className="alert alert-danger"
						dangerouslySetInnerHTML={ this.createMarkup( error ) }
					/>
				) }
				{ this._isMounted && posts.length ? (
					<div
						className="slider-wrap"
						// style={ { background: bgColor } }
					>
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
														: DefaultImg
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
										style={ { color: textColor } }
										className="titles__title | js-title"
									>
										{ post.title.rendered }
									</div>
								) ) }
							</div>
						</div>

						{/* <div className="titles faded">
							<div className="titles__title titles__title--proxy">
								Lorem ipsum
							</div>
							<div className="titles__list | js-titles">
								{ posts.map( ( post, index ) => (
									<div
										key={ index }
										style={ { color: textColor } }
										className="titles__title | js-title"
									>
										{ post.title.rendered }
									</div>
								) ) }
							</div>
						</div> */}

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
