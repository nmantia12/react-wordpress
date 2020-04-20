import React from 'react';
import Navbar from "./Navbar";
import Slider from "./Slider";
import FeaturedImage from "./layouts/FeaturedImage";
import axios from 'axios';
import Loader from "../loader.gif";
import renderHTML from 'react-render-html';
import Moment from 'react-moment';
import { Link } from '@reach/router';
import clientConfig from '../client-config';

class Home extends React.Component {

	constructor( props ) {
		super( props );

		this.state = {
			loading : false,
			posts: [],
			error: ''
		};
	}

	createMarkup = ( data ) => ({
		__html: data
	});

	componentDidMount() {
		const wordPressSiteURL = clientConfig.siteUrl;
		this._isMounted = true;

		if (this._isMounted) {
			this.setState( { loading: true }, () => {
				axios.get( `${wordPressSiteURL}/wp-json/wp/v2/posts?_embed` )
					.then( res => {
						if ( 200 === res.status ) {
							if ( res.data.length ) {
								this.setState( { loading: false, posts: res.data } );
							} else {
								this.setState( { loading: false, error: 'No Posts Found' } );
							}
						}

					} )
					.catch( err => this.setState( { loading: false, error: err } ) );
			} )
		}
	}

  componentWillUnmount() {
    this._isMounted = false;
  }

	render() {
		const { loading, posts, error } = this.state;

		return(
			<React.Fragment>
				<Navbar/>
				{ error && <div className="alert alert-danger" dangerouslySetInnerHTML={ this.createMarkup( error ) }/> }
				{ posts.length ? (
					<div className="mt-5 posts-container">
						{ posts.map( post => (
							<div key={post.id} className="card border-dark mb-3" style={{maxWidth: '50rem', margin: '0 auto'}}>

								{/*Featured Image*/}
								{ post._embedded['wp:featuredmedia'] && <Link to={`/post/${post.id}`}><FeaturedImage image={post._embedded['wp:featuredmedia']['0'] } /></Link> }

								<div className="card-header">
									<Link to={`/post/${post.id}`}className="text-secondary font-weight-bold" style={{ textDecoration: 'none' }}>

										{renderHTML( post.title.rendered )}
									</Link>
								</div>
								<div className="card-body">
									<div className="card-text post-content">{ renderHTML( post.excerpt.rendered ) }</div>
								</div>
								<div className="card-footer">
									<Moment fromNow >{post.date}</Moment>
									<Link to={`/post/${post.id}`} className="btn btn-secondary float-right" style={{ textDecoration: 'none' }}>
										Read More...
									</Link>
								</div>
							</div>
						) ) }
					</div>
				) : '' }
				{ loading && <img className="loader" src={Loader} alt="Loader"/> }
				<Slider />
				{/* <div className="slider | js-drag-area">
					<div className="slider__inner | js-slider">
						<div className="slide | js-slide">
							<div className="slide__inner | js-slide__inner">
								<img className="js-slide__img" src="http://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/tex1.jpg" alt="" crossorigin="anonymous" draggable="false"/>
							</div>
						</div>
						<div className="slide | js-slide" style="left: 120%;">
							<div className="slide__inner | js-slide__inner">
								<img className="js-slide__img" src="http://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/tex2.jpg" alt="" crossorigin="anonymous" draggable="false"/>
							</div>
						</div>
						<div className="slide | js-slide" style="left: 240%;">
							<div className="slide__inner | js-slide__inner">
								<img className="js-slide__img" src="http://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/tex1.jpg" alt="" crossorigin="anonymous" draggable="false"/>
							</div>
						</div>
						<div className="slide | js-slide" style="left: 360%;">
							<div className="slide__inner | js-slide__inner">
								<img className="js-slide__img" src="http://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/tex2.jpg" alt="" crossorigin="anonymous" draggable="false"/>
							</div>
						</div>
						<div className="slide | js-slide" style="left: 480%;">
							<div className="slide__inner | js-slide__inner">
								<img className="js-slide__img" src="http://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/tex1.jpg" alt=""crossorigin="anonymous"  draggable="false"/>
							</div>
						</div>
						<div className="slide | js-slide" style="left: 600%;">
							<div className="slide__inner | js-slide__inner">
								<img className="js-slide__img" src="http://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/tex2.jpg" alt="" crossorigin="anonymous" draggable="false"/>
							</div>
						</div>
						<div className="slide | js-slide" style="left: 720%;">
							<div className="slide__inner | js-slide__inner">
								<img className="js-slide__img" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/tex1.jpg" alt="" crossorigin="anonymous" draggable="false"/>
							</div>
						</div>
						<div className="slide | js-slide" style="left: 840%;">
							<div className="slide__inner | js-slide__inner">
								<img className="js-slide__img" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/tex2.jpg" alt="" crossorigin="anonymous" draggable="false"/>
							</div>
						</div>
					</div>
				</div>

				<div className="titles">
					<div className="titles__title titles__title--proxy">Lorem ipsum</div>
					<div className="titles__list | js-titles">
						<div className="titles__title | js-title">Moonrocket</div>
						<div className="titles__title | js-title">Spaceman</div>
						<div className="titles__title | js-title">Moonrocket</div>
						<div className="titles__title | js-title">Spaceman</div>
						<div className="titles__title | js-title">Moonrocket</div>
						<div className="titles__title | js-title">Spaceman</div>
						<div className="titles__title | js-title">Moonrocket</div>
						<div className="titles__title | js-title">Spaceman</div>
						<div className="titles__title | js-title">Moonrocket</div>
					</div>
				</div>

				<div className="progress">
					<div className="progress__line | js-progress-line"></div>
					<div className="progress__line | js-progress-line-2"></div>
				</div> */}

			</React.Fragment>
		);
	}
}

export default Home;
