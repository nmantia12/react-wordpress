import React, { Component } from 'react';
import gsap from 'gsap';
import { store } from './Store';
import axios from 'axios';
import Spinner from '../../loader.gif';
import DefaultImg from '../../default.png';
import FeaturedImage from '../layouts/FeaturedImage';
import renderHTML from 'react-render-html';
import Moment from 'react-moment';
import { Link } from '@reach/router';
import clientConfig from '../../client-config';
import Plane from './Plane';
import Gl from './Gl';
import * as Vibrant from 'node-vibrant';

class Slider extends Component {
	constructor( props ) {
		super( props );
		this.bindAll();

		this.el = React.createRef();

		this.onScrollEvent = this.onScrollEvent.bind( this );

		this.opts = {
			speed: 2,
			threshold: 50,
			ease: 0.035,
		};

		this.animate = this.animate.bind( this );

		this.state = {
			loading: false,
			bgColor: '#111',
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
		this.items = [];

		this.events = {
			move: store.isDevice ? 'touchmove' : 'mousemove',
			up: store.isDevice ? 'touchend' : 'mouseup',
			down: store.isDevice ? 'touchstart' : 'mousedown',
		};

		this.onWindowResize = this.onWindowResize.bind( this );
		window.addEventListener( 'resize', this.onWindowResize );
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
		this.plane.init( this.el.current, this.gl );
	}

	doStuffWithPalette = ( imgSrc, index ) => {
		const colors = this.colors;
		Vibrant.from( imgSrc )
			.getPalette()
			.then( ( palette ) => {
				// do what ever you want with palette, even setState if you want to, just avoid calling it from a render/componentWillUpdate/componentDidUpdate to avoid having the same error you've got in the first place
				const hex = palette.Vibrant.hex;
				colors[ index ] = hex;
				this.setState( { colors } );
			} )
			.catch( ( error ) => {
				// handle errors
				const hex = '#111';
				colors[ index ] = hex;
				this.setState( { colors } );
			} );
	};

	componentDidMount() {
		const wordPressSiteURL = clientConfig.siteUrl;
		this._isMounted = true;

		if ( this._isMounted ) {
			window.addEventListener( 'scroll', this.onScrollEvent );
			this.setState( { loading: true }, () => {
				axios
					.get(
						`${ wordPressSiteURL }/wp-json/wp/v2/portfolio?_embed&per_page=9`
					)
					.then( ( res ) => {
						if ( 200 === res.status ) {
							if ( res.data.length && this._isMounted ) {
								res.data.map( ( post, index ) => {
									const imgUrl =
										post.better_featured_image &&
										post.better_featured_image
											? post.better_featured_image
												.source_url
											: DefaultImg;

									this.doStuffWithPalette( imgUrl, index );
								} );

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
		const { flags, colors } = this.state;

		for ( let i = 0; i < this.items.length; i++ ) {
			const item = this.items[ i ];
			const { translate, isVisible, progress } = this.isVisible( item );

			item.plane.updateX( translate );
			item.plane.mat.uniforms.uVelo.value = this.state.diff;

			if ( ! item.out && item.tl ) {
				item.tl.progress( progress );

				if ( progress > 0.35 && progress < 0.66 ) {
					const hex = colors[ i ] ? colors[ i ] : '#111';
					this.setState( { bgColor: hex } );
				}
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

	onScrollEvent( e ) {
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
		const { loading, posts, error, colors, bgColor } = this.state;

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
						style={ { background: bgColor } }
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

						<div className="titles faded">
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
