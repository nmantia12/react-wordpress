import React from 'react';
import { Link } from '@reach/router';

/**
 * Reach Routers gives us access to a function called getProps.
 * Whatever is returned by getProps(), in this case style,
 * will be applied to the Link attribute as props.
 * So here {...props} will be replaced by style: {}
 *
 * @param props
 * @return {*}
 * @class
 */
const NavLink = ( props ) => (
	<Link
		{ ...props }
		getProps={ ( { isCurrent } ) => ( {
			style: { color: isCurrent ? '#fff' : '#fff' },
		} ) }
		className="nav-link"
	/>
);

export default NavLink;
