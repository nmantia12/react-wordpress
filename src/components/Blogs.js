import React from 'react';
import { Posts } from './Posts';
import Content from './content/Content';

class Blogs extends React.Component {
		constructor( props ) {
		super( props );
	}

	render() {
		return (
			<React.Fragment>
				<Content>
					<Posts pageId={1} />
				</Content>
			</React.Fragment>
		);
	}
};

export default Blogs;
