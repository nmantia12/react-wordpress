import React from 'react';
import Posts from './Posts';
import Content from './content/Content';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

const Page = ( props ) => {
	const { id } = props;

	return (
		<React.Fragment>
			<TransitionGroup className="page-transition">
				<CSSTransition classNames="fade" timeout={ 500 }>
					<Content>
						<Posts pageId={ id } />
					</Content>
				</CSSTransition>
			</TransitionGroup>
		</React.Fragment>
	);
};

export default Page;
