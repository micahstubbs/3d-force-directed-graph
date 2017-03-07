THREE.TrackballControls = TrackballControls; //Link module to Three

const Graph = ForceGraph3D()
	(document.getElementById("3d-graph"));

let curDataSetIdx;
const dataSets = getGraphDataSets();
console.log('dataSets from index.js', dataSets);

let toggleData;
(toggleData = function() {
	curDataSetIdx = curDataSetIdx === undefined ? 0 : (curDataSetIdx+1)%dataSets.length;
	const dataSet = dataSets[curDataSetIdx];

	dataSet(Graph); // Load data set
	document.getElementById('graph-data-description').innerHTML = dataSet.description ? `Viewing ${dataSet.description}` : '';
})(); // IIFE init