import React from 'react';
import { TweenMax } from 'gsap';
import { paper } from 'paper';
const SimplexNoise = require( 'simplex-noise' );
import Util from './util';

class Cursor extends React.Component {
	constructor( props ) {
		super( props );
		this._isMounted = false;
	}

	componentDidMount() {
		this._isMounted = true;

		if ( this._isMounted ) {
			this.initCursor();
			this.initCanvas();
			this.initHovers();
		}
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	onWindowResize( ) {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	initCursor() {
		this.clientX = -100;
		this.clientY = -100;
		this.innerCursor = document.querySelector( '.circle-cursor--inner' );
		this.outerCursorSpeed = 1;
		this.lastX = 0;
		this.lastY = 0;
		this.isStuck = false;
		this.showCursor = false;

		const unveilCursor = ( e ) => {
			this.group.position = new paper.Point( e.clientX, e.clientY );
			setTimeout( () => {
				this.outerCursorSpeed = 0.2;
			}, 100 );
			this.showCursor = true;
		};
		document.addEventListener( 'mousemove', unveilCursor );

		document.addEventListener( 'mousemove', ( e ) => {
			this.clientX = e.clientX;
			this.clientY = e.clientY;
		} );

		this.onWindowResize = this.onWindowResize.bind( this );
		window.addEventListener( 'resize', this.onWindowResize );

		const renderCursor = () => {
			TweenMax.set( this.innerCursor, {
				x: this.clientX,
				y: this.clientY,
			} );
			if ( this.showCursor ) {
				document.removeEventListener( 'mousemove', unveilCursor );
			}
			requestAnimationFrame( renderCursor );
		};
		requestAnimationFrame( renderCursor );
	}

	initCanvas() {
		const canvas = document.querySelector( '.circle-cursor--outer' );
		this.canvas = canvas;
		const shapeBounds = {
			width: 100,
			height: 100,
		};

		paper.setup( this.canvas );

		const strokeColor = 'rgba(6, 244, 244, 0.5)';
		const strokeWidth = 2;
		const segments = 8;
		const radius = 30;
		const noiseScale = 150; // speed
		const noiseRange = 4; // range of distortion
		let isNoisy = false;

		const polygon = new paper.Path.RegularPolygon(
			new paper.Point( 0, 0 ),
			segments,
			radius
		);
		polygon.strokeColor = strokeColor;
		polygon.strokeWidth = strokeWidth;
		polygon.smooth();
		this.polygon = polygon;

		this.group = new paper.Group( [ polygon ] );
		this.group.applyMatrix = false;

		const noiseObjects = polygon.segments.map( () => new SimplexNoise() );
		let bigCoordinates = [];

		paper.view.onFrame = ( event ) => {
			if ( ! this.isStuck ) {
				// move circle around normally
				this.lastX = Util.lerp(
					this.lastX,
					this.clientX,
					this.outerCursorSpeed
				);
				this.lastY = Util.lerp(
					this.lastY,
					this.clientY,
					this.outerCursorSpeed
				);
				this.group.position = new paper.Point( this.lastX, this.lastY );
			} else if ( this.isStuck ) {
				// fixed position on a nav item
				this.lastX = Util.lerp(
					this.lastX,
					this.stuckX,
					this.outerCursorSpeed
				);
				this.lastY = Util.lerp(
					this.lastY,
					this.stuckY,
					this.outerCursorSpeed
				);
				this.group.position = new paper.Point( this.lastX, this.lastY );
			}

			if ( this.isStuck && polygon.bounds.width < shapeBounds.width ) {
				// scale up the shape
				polygon.scale( 1.08 );
			} else if ( ! this.isStuck && polygon.bounds.width > 30 ) {
				// remove noise
				if ( isNoisy ) {
					polygon.segments.forEach( ( segment, i ) => {
						segment.point.set(
							bigCoordinates[ i ][ 0 ],
							bigCoordinates[ i ][ 1 ]
						);
					} );
					isNoisy = false;
					bigCoordinates = [];
				}

				// scale down the shape
				const scaleDown = 0.92;
				polygon.scale( scaleDown );
			}

			// while stuck and when big, do perlin noise
			if ( this.isStuck && polygon.bounds.width >= shapeBounds.width ) {
				isNoisy = true;

				// first get coordinates of large circle
				if ( bigCoordinates.length === 0 ) {
					polygon.segments.forEach( ( segment, i ) => {
						bigCoordinates[ i ] = [
							segment.point.x,
							segment.point.y,
						];
					} );
				}

				// calculate noise value for each point at that frame
				polygon.segments.forEach( ( segment, i ) => {
					const noiseX = noiseObjects[ i ].noise2D(
						event.count / noiseScale,
						0
					);
					const noiseY = noiseObjects[ i ].noise2D(
						event.count / noiseScale,
						1
					);

					const distortionX = Util.map(
						noiseX,
						-1,
						1,
						-noiseRange,
						noiseRange
					);
					const distortionY = Util.map(
						noiseY,
						-1,
						1,
						-noiseRange,
						noiseRange
					);

					const newX = bigCoordinates[ i ][ 0 ] + distortionX;
					const newY = bigCoordinates[ i ][ 1 ] + distortionY;

					segment.point.set( newX, newY );
				} );
			}

			// hover state for main nav items
			if ( this.fillOuterCursor && polygon.fillColor !== strokeColor ) {
				polygon.fillColor = strokeColor;
				polygon.strokeColor = 'transparent';
			} else if (
				! this.fillOuterCursor &&
				polygon.fillColor !== 'transparent'
			) {
				polygon.strokeColor = 'rgba(6, 244, 244, 0.5)';
				polygon.fillColor = 'transparent';
			}

			polygon.smooth();
		};
	}

	initHovers() {
		const mainNavItemMouseEnter = ( e ) => {
			const navItem = e.currentTarget;
			const navItemBox = navItem.getBoundingClientRect();
			this.stuckX = Math.round( navItemBox.left + navItemBox.width / 2 );
			this.stuckY = Math.round( navItemBox.top + navItemBox.height / 2 );
			this.isStuck = true;
		};

		const mainNavItemMouseLeave = () => {
			this.isStuck = false;
		};

		const mainNavItems = document.querySelectorAll(
			'.hamburger-wrapper, .logo-container'
		);
		mainNavItems.forEach( ( item ) => {
			item.addEventListener( 'mouseenter', mainNavItemMouseEnter );
			item.addEventListener( 'mouseleave', mainNavItemMouseLeave );
		} );

		const linkItemMouseEnter = () => {
			this.outerCursorSpeed = 0.8;
			this.fillOuterCursor = true;
			TweenMax.to( this.innerCursor, 0.2, { opacity: 0 } );
		};
		const linkItemMouseLeave = () => {
			this.outerCursorSpeed = 0.2;
			this.fillOuterCursor = false;
			TweenMax.to( this.innerCursor, 0.2, { opacity: 1 } );
		};

		const linkItems = document.querySelectorAll( '#content a' );
		linkItems.forEach( ( item ) => {
			item.addEventListener( 'mouseenter', linkItemMouseEnter );
			item.addEventListener( 'mouseleave', linkItemMouseLeave );
		} );
	}

	render() {
		return (
			<React.Fragment>
				<div className="circle-cursor circle-cursor--inner"></div>
				<canvas className="circle-cursor circle-cursor--outer"></canvas>
			</React.Fragment>
		);
	}
}

export default Cursor;
