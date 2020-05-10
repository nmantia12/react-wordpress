import React from 'react';
import Navbar from './Navbar';
import Slider from './slider/Slider';
import FeaturedImage from './layouts/FeaturedImage';
import axios from 'axios';
import Loader from '../loader.gif';
import renderHTML from 'react-render-html';
import Moment from 'react-moment';
import { Link } from '@reach/router';
import clientConfig from '../client-config';

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
				<Navbar />
				<Slider />
			</React.Fragment>
		);
	}
}

export default Home;
