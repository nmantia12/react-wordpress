import React from 'react';
import FeaturedImage from './FeaturedImage';
import { Link } from '@reach/router';

export const Post = ( props ) => {
	const { post } = props;

	return (
		<div className="post-wrapper">
			{ /*TItle*/ }
			{ post.title ? (
				<Link to={ `/post/${ post.id }` } className="post-title">
					{ post.title }
				</Link>
			) : (
				''
			) }

			{ /*Featured Image*/ }
			{ /* { post._embedded['wp:featuredmedia'] && <Link to={`/post/${post.id}`}><FeaturedImage image={post._embedded['wp:featuredmedia']['0'] } /></Link> } */ }

			{ /*Excerpt*/ }
			{ post.title ? (
				<p className="post-excerpt mt-4">{ post.excerpt }</p>
			) : (
				''
			) }

			{ /*Post meta*/ }
			<div className="post-meta">
				{ /*Author*/ }
				<Link
					to={ `/author/${ post.meta.author_id }` }
					className="post-author"
				>
					<i className="fa fa-user" />
					<span>{ post.meta.author_name }</span>
				</Link>
				{ /*Date*/ }
				<div className="post-date">
					<i className="fa fa-clock-o" />
					<span>{ post.date }</span>
				</div>

				{ /*	Categories*/ }
				{ post.categories.length ? (
					<div className="post-category">
						<i className="fa fa-folder" />
						{ post.categories.map( ( category, index ) => {
							return (
								// If its not the last item.
								index !== post.categories.length - 1 ? (
									<Link
										to={ `category/${ category.term_id }` }
										key={ category.term_id }
									>
										{ category.name },{ ' ' }
									</Link>
								) : (
									<Link
										to={ `category/${ category.term_id }` }
										key={ category.term_id }
									>
										{ category.name }
									</Link>
								)
							);
						} ) }
					</div>
				) : (
					''
				) }
			</div>
		</div>
	);
};
