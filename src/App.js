import React from 'react';
import Ocean from './3d/Ocean';
import Globe from './3d/Globe';
import ModelViewer from './3d/ModelViewer';
import './style.scss';
import { Router, Link, Redirect, Location } from '@reach/router';
import Login from './components/Login';
import Dashboard from './components/dashboard/Dashboard';
import Home from './components/Home';
import SinglePost from './components/SinglePost';
import CreatePost from './components/dashboard/posts/CreatePost';
import AppProvider from './components/context/AppProvider';
import Posts from './components/dashboard/posts/Posts';
import Pages from './components/dashboard/pages/Pages';
import Blogs from './components/Blogs';
import Page from './components/Page';
import { AnimatePresence } from 'framer-motion';


class App extends React.Component {

	render() {
		return (
			<AppProvider>
				<Router className="router" id="global_router">
					<Home path="/" />
					<Blogs path="/blogs/" />
					<Page path="/page/:id" />
					{ /* <Login path="/login" /> */ }
					<Dashboard path="/dashboard" />
					<Posts path="/dashboard/posts" />
					<CreatePost path="/dashboard/create-post" />
					<Pages path="/dashboard/pages" />
					<SinglePost path="/project/:id" />
					{ /* <ModelViewer path="/model" />
					<Ocean path="/ocean" />
					<Globe path="/globe" /> */ }
				</Router>
			</AppProvider>
		);
	}
}

export default App;
