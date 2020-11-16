import React, { useContext, useState } from 'react';
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
const NavLink = ( props ) => {
	return (
		<Link
			{ ...props }
			getProps={ ( { isCurrent } ) => ( {
				style: { color: isCurrent ? '#fff' : '#000' },
			} ) }
			className="nav-link"
		/>
	);
};
export default NavLink;
