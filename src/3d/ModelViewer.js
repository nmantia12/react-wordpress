import React from 'react';
import '@google/model-viewer/dist/model-viewer.js';
import 'focus-visible';
import Navbar from '../components/Navbar';
import Content from '../components/content/Content';

const ModelViewer = () => {
	return (
		<Content>
			<div id="container">
				{ /* <div id="instructions">
					<button onClick="addHotspot()">Add Hotspot</button><br/>
					Then click on the model.<br/>
					To remove a hotspot, select it, then click:<br/>
					<button onClick="removeHotspot()">Remove Hotspot</button><br/>
				</div> */ }
				<model-viewer
					id="hotspot-demo"
					camera-controls
					src="https://cdn.glitch.com/36cb8393-65c6-408d-a538-055ada20431b/Astronaut.glb?1542147958948"
					alt="A 3D model of an astronaut."
				></model-viewer>
			</div>
		</Content>
	);
};
export default ModelViewer;
