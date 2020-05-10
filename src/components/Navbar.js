import React, { useContext, useState } from 'react';
import NavLink from './NavLink';
import { Link } from '@reach/router';
import { isLoggedIn } from './functions';
import ToggleSidebarBtn from './dashboard/sidebar/ToggleSidebarBtn';
import AppContext from './context/AppContext';
import Logo from './layouts/Logo';

const Navbar = () => {
	const [ store, setStore ] = useContext( AppContext );
	const [ modalOpen, setModalOpen ] = useState( false );

	let buttonClassName = 'hamburger-wrapper';
	let overlayClassname = 'menu-overlay';

	if ( modalOpen ) {
		buttonClassName = 'hamburger-wrapper active';
		overlayClassname = 'menu-overlay active';
	}

	const handleLogout = () => {
		localStorage.removeItem( 'token' );
		localStorage.removeItem( 'useName' );

		setStore( {
			...store,
			token: '',
			useName: '',
		} );
		window.location.href = '/';
	};

	const toggleMenuOverlay = ( event ) => {
		event.preventDefault();

		if ( modalOpen ) {
			setModalOpen( false );
		} else {
			setModalOpen( true );
		}
	};

	return (
		<nav className="navbar my-navbar navbar-expand-lg main-navbar">
			<Link to="/">
				<Logo />
			</Link>
			<button className={ buttonClassName } onClick={ toggleMenuOverlay }>
				<span className="hamburger" />
			</button>

			{ /*	If on dashboard page */ }
			{ window.location.pathname.includes( 'dashboard' ) ? (
				<ToggleSidebarBtn />
			) : (
				''
			) }

			<div className={ overlayClassname }>
				<div>
					<ul className="navbar-nav my-navbar-nav mr-auto">
						<li className="nav-item">
							<NavLink to="/">Home</NavLink>
						</li>
						<li className="nav-item">
							<NavLink to="/blogs">Blogs</NavLink>
						</li>
						<li className="nav-item">
							<NavLink to="/ocean">Ocean</NavLink>
						</li>
						<li className="nav-item">
							<NavLink to="/globe">Globe</NavLink>
						</li>
						<li className="nav-item">
							<NavLink to="/model">Model Viewer</NavLink>
						</li>
						{ isLoggedIn() ? (
							<React.Fragment>
								<li className="nav-item">
									<NavLink to={ `/dashboard ` }>
										Dashboard
									</NavLink>
								</li>
								<li className="nav-item">
									<button
										onClick={ handleLogout }
										className="btn btn-secondary ml-3"
									>
										Logout
									</button>
								</li>
							</React.Fragment>
						) : (
							<li className="nav-item">
								<NavLink to="/login">Login</NavLink>
							</li>
						) }
					</ul>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
