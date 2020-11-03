import React from 'react';
import Ocean from './3d/Ocean';
import Globe from './3d/Globe';
import ModelViewer from './3d/ModelViewer';
import './style.scss';
import { Router } from '@reach/router';
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
import Cursor from './components/cursor/Cursor';

class App extends React.Component {
	init() {}
	render() {
		return (
			<AppProvider>
				<Cursor />
				<Router id="global_router">
					<Home path="/" />
					<Blogs path="/blogs/" />
					<Page path="/page/:id" />
					<Login path="/login" />
					<Dashboard path="/dashboard" />
					<Posts path="/dashboard/posts" />
					<CreatePost path="/dashboard/create-post" />
					<Pages path="/dashboard/pages" />
					<SinglePost path="/portfolio/:id" />
					<ModelViewer path="/model" />
					<Ocean path="/ocean" />
					<Globe path="/globe" />
				</Router>
			</AppProvider>
		);
	}
}

export default App;
