import React from 'react';
import Slider from './slider/Slider';
import Content from './content/Content';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

class Home extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			loading: false,
			posts: [],
			error: '',
		};
	}

	createMarkup = ( data ) => ( {
		__html: data,
	} );

	componentDidMount() {
		this._isMounted = true;
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	render() {
		return (
			<React.Fragment>
				<TransitionGroup className="page-transition">
					<CSSTransition classNames="fade" timeout={ 500 }>
						<Content>
							<Slider />
						</Content>
					</CSSTransition>
				</TransitionGroup>
			</React.Fragment>
		);
	}
}

export default Home;
