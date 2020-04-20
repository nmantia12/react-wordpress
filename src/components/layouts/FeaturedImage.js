import React from 'react';

const FeaturedImage = ( props ) => {
	const width = props.image.media_details.sizes.large.width;
	const height = props.image.media_details.sizes.large.height;
	const sourceUrl = props.image.source_url;
	const { title } = props.image.title;

	return (
		<img width={ width } height={ height }
		     src={ sourceUrl }
		     className="attachment-post-thumbnail size-post-thumbnail wp-post-image"
		     alt={ title }
		/>
	)
};

export default FeaturedImage;
