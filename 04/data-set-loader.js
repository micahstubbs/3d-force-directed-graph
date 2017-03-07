function getGraphDataSets() {

    // Color brewer paired set
    const colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'];

    const loadMiserables = function(Graph) {
        qwest.get('miserables.json').then((_, data) => {
            const nodes = {};
            data.nodes.forEach(node => { nodes[node.id] = node }); // Index by ID

            console.log('data from loadMiserables', data);

            Graph
                .resetState()
                .nameAccessor(node => node.id)
                .colorAccessor(node => parseInt(colors[node.group%colors.length].slice(1),16))
                .graphData({
                    nodes: nodes,
                    links: data.links.map(link => [link.source, link.target])
                });
        });
    };
    loadMiserables.description = "<em>Les Miserables</em> data (<a href='https://bl.ocks.org/mbostock/4062045'>4062045</a>)";

    //

    const loadBlocks = function(Graph) {
        qwest.get('blocks.json').then((_, data) => {
            const userColors = {};
            Array.from(new Set(data.nodes.map(node => node.user || null))).forEach((user, idx) => {
                userColors[user] = colors[idx%colors.length]; // Rotate colors
            });

            const nodes = {};
            data.nodes.forEach(node => { nodes[node.id] = node }); // Index by ID

            Graph
                .resetState()
                .nameAccessor(node => `${node.user?node.user+': ':''}${node.description || node.id}`)
                .colorAccessor(node => parseInt(userColors[node.user || null].slice(1), 16))
                .graphData({
                    nodes: nodes,
                    links: data.links.map(link => [link.source, link.target])
                });
        });
    };
    loadBlocks.description = "<em>Blocks</em> data (<a href='https://bl.ocks.org/mbostock/afecf1ce04644ad9036ca146d2084895'>afecf1ce04644ad9036ca146d2084895</a>)";

    //

    const loadD3Dependencies= function(Graph) {
        qwest.get('d3.csv').then((_, csvData) => {
            const { data: [, ...data] } = Papa.parse(csvData); // Parse csv
            data.pop(); // Remove last empty row

            const nodes = {}, links = [], modules = new Set();
            data.forEach(([size, path]) => {
                const levels = path.split('/'),
                    module = levels.length > 1 ? levels[1] : null,
                    leaf = levels.pop(),
                    parent = levels.join('/');

                modules.add(module);

                nodes[path] = {
                    leaf: leaf,
                    module: module,
                    path: path,
                    size: +size || 1
                };

                if (parent) {
                    links.push([parent, path]);
                }
            });

            const moduleColors = {};
            Array.from(modules).forEach((module, idx) => {
                moduleColors[module] = colors[idx%colors.length]; // Rotate colors
            });

            Graph
                .resetState()
                .nodeRelSize(0.5)
                .valAccessor(node => node.size)
                .nameAccessor(node => node.path)
                .colorAccessor(node => parseInt(moduleColors[node.module || null].slice(1), 16))
                .graphData({ nodes: nodes, links: links });
        });
    };
    loadD3Dependencies.description = "<em>D3 dependencies</em> data (<a href='https://bl.ocks.org/mbostock/9a8124ccde3a4e9625bc413b48f14b30'>9a8124ccde3a4e9625bc413b48f14b30</a>)";

    //

    const loadGroups = function(Graph) {
        qwest.get('groups.json').then((_, data) => {
            const nodes = {};

            // add an id property and
            // Index by name
            data.nodes.forEach((node, i) => { 
                node.id = i;
                node.groupLabel =  node.group;
                node.group = Number(node.group.split(' ')[1]) || 0;
                nodes[node.id] = node;
            });

            console.log('data from loadGroups', data);
            console.log('nodes from loadGroups', nodes);

            Graph
                .resetState()
                .nameAccessor(node => node.id)
                .colorAccessor(node => parseInt(colors[node.group%colors.length].slice(1),16))
                .graphData({
                    nodes: nodes,
                    links: data.links.map(link => [link.source, link.target])
                });
        });
    };
    loadGroups.description = "<em>Group Membership</em> data (<a href='http://bl.ocks.org/tomshanley/d3185cf3bde18b223376'>d3185cf3bde18b223376</a>)";

    //

    return [loadGroups, loadMiserables, loadBlocks, loadD3Dependencies];
}