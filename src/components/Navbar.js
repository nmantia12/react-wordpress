import React, { useContext, useState } from 'react';
import NavLink from './NavLink';
import { Link } from '@reach/router';
import { isLoggedIn } from './functions';
import ToggleSidebarBtn from './dashboard/sidebar/ToggleSidebarBtn';
// import AppContext from './context/AppContext';
import Logo from './layouts/Logo';
import { motion } from 'framer-motion';

const transition = {
	duration: 0.6,
	ease: [ 0.6, 0.01, -0.05, 0.9 ],
};

const variants = {
	open: {
		opacity: 1,
		pointerEvents: 'auto',
	},
	closed: {
		opacity: 0,
		pointerEvents: 'none',
	},
};

const Navbar = () => {
	// const [ store, setStore ] = useContext( AppContext );
	const [ isOpen, setIsOpen ] = useState( false );

	const buttonClassName = 'hamburger-wrapper';
	const overlayClassname = 'menu-overlay';

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

	return (
		<nav className="navbar my-navbar navbar-expand-lg main-navbar">
			<Link to="/">
				<Logo />
			</Link>
			<button
				className={
					isOpen ? 'hamburger-wrapper active' : 'hamburger-wrapper'
				}
				onClick={ () => setIsOpen( ! isOpen ) }
			>
				<span className="hamburger" />
			</button>

			{ /*	If on dashboard page */ }
			{ window.location.pathname.includes( 'dashboard' ) ? (
				<ToggleSidebarBtn />
			) : (
				''
			) }

			<motion.div
				initial={ { closed } }
				exit={ { closed } }
				transition={ { transition } }
				animate={ isOpen ? 'open' : 'closed' }
				className={ isOpen ? 'menu-overlay active' : 'menu-overlay' }
				variants={ variants }
			>
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
			</motion.div>
		</nav>
	);
};

export default Navbar;
