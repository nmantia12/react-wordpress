import React from 'react';
import renderHTML from 'react-render-html';
import FeaturedImage from './layouts/FeaturedImage';
import Content from './content/Content';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

class SinglePost extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			loading: false,
			post: props.location.state.post ? props.location.state.post : {},
			error: '',
			appClass: 'card',
		};
	}

	createMarkup = ( data ) => ( {
		__html: data,
	} );

	componentDidMount() {
		setTimeout( () => {
			this.setState( { appClass: 'card active' } );
		}, 50 );
	}

	render() {
		const { loading, post, error, scale } = this.state;

		return (
			<React.Fragment>
				<TransitionGroup className="page-transition">
					<CSSTransition classNames="fade" timeout={ 500 }>
						<Content>
							<div className="posts-container">
								<div key={ post.id } className={ this.state.appClass }>
									<div className="card-header">
										{ /*Featured Image*/ }
										{ post._embedded[ 'wp:featuredmedia' ] && (
											<FeaturedImage
												image={
													post._embedded[
														'wp:featuredmedia'
													][ '0' ]
												}
											/>
										) }
									</div>
								</div>
							</div>
							<div className="card-body">
								<div className="card-text post-content">
									<h1>{ renderHTML( post.title.rendered ) }</h1>
									{ renderHTML( post.content.rendered ) }
								</div>
							</div>
							<div className="card-footer">
								{ /* <Moment fromNow>{ post.date }</Moment> */ }
							</div>
						</Content>
					</CSSTransition>
				</TransitionGroup>
			</React.Fragment>
		);
	}
}

export default SinglePost;
