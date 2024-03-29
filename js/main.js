d3.csv('data/ufoSample.csv')
.then(data => {
    let shapeCounts = new Map();
    data.forEach(d => {
      d.latitude = +d.latitude; // Ensure these are numbers
      d.longitude = +d.longitude; // Ensure these are numbers
      let count = shapeCounts.get(d.ufo_shape) || 0;
      shapeCounts.set(d.ufo_shape, count + 1);
    });

    let pieData = [...shapeCounts].map(([shape, count]) => ({shape, count}));

    // Initialize charts
    leafletMap = new LeafletMap({ parentElement: '#leaflet-map'}, data);
    //pieChart = new PieChart({parentElement : '#pie-chart-container'}, pieData);

    // Load the inverted index and initialize the WordCloud
    d3.json('data/inverted_index.json').then(invertedIndex => {
      wordCloud = new WordCloud({parentElement: '#wordcloud-container'}, invertedIndex);
    });
})
.catch(error => console.error(error));
