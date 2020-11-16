import React, { Component, useContext } from 'react';
import Navbar from '../Navbar';
// import AppContext from '../context/AppContext';
import Cursor from '../../components/cursor/Cursor';

class Content extends React.Component {
	// const [ store, setStore ] = useContext( AppContext );
	constructor(props) {
		super(props);
	}

	render() {
		const props = this.props;
		return (
			<React.Fragment>
				<div
					id="content"
				// className={ store.sidebarActive ? 'sidebar-active' : '' }
				>
					{ /* Cursor */}
					<Cursor />
					{ /* Top Navbar */}
					<Navbar />
					{ /* Main Content */}
					{props.children}
				</div>
			</React.Fragment>
		);
	}

};

export default Content;
