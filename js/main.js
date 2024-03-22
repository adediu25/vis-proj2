// d3.csv('data/ufo_sightings.csv')
d3.csv('data/ufoSample.csv')
.then(data => {
    console.log(data[0]);
    console.log(data.length);

    const parseTime = d3.timeParse("%m/%d/%Y %H:%M");

    data.forEach(d => {
      // console.log(d);
      d.latitude = +d.latitude; //make sure these are not strings
      d.longitude = +d.longitude; //make sure these are not strings
    
      d.date_time = parseTime(d.date_time);
      // Group into 10-year intervals by rounding down the year
      d.decade = Math.floor(d.date_time.getFullYear() / 5) * 5;
    });

    // Initialize chart and then show it
    leafletMap = new LeafletMap({ parentElement: '#leaflet-map'}, data);
    timeline = new Timeline({parentElement: '#timeline'}, data);

  })
  .catch(error => console.error(error));
