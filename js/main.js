let leafletMap, timeline, shapeChart, monthChart, timeChart, durationChart;

d3.csv('data/ufo_sightings.csv')
// d3.csv('data/ufoSample.csv')
.then(data => {
    console.log(data[0]);
    console.log(data.length);

    const parseTime = d3.timeParse("%m/%d/%Y %H:%M");

    data.forEach(d => {
      // console.log(d);

      const [datePart, timePart] = d.date_time.split(' ');
      const [hourStr, minuteStr] = timePart.split(':');
      const hour = parseInt(hourStr, 10);
      const [month, day, year] = datePart.split('/');
      const encounter_length = parseInt(d.encounter_length);
      d.tod = +hour;
      d.year = +year;
      d.month = +month;

      d.encounter_length = +encounter_length;

      d.latitude = +d.latitude; //make sure these are not strings
      d.longitude = +d.longitude; //make sure these are not strings
    
      d.date_time = parseTime(d.date_time);
      // Group into 10-year intervals by rounding down the year
      d.decade = Math.floor(d.date_time.getFullYear() / 5) * 5;

      const date = new Date(d.date_time);
      d.hour = date.getHours(); // getHours to get the hour of the sighting
      d.month = date.getMonth();
    });
    
    // Initialize the colorBy value
    let colorBy = "year";

    // Get the values that are in the dropdowns
    const colorOption = document.getElementById("color-by-option");

    colorOption.addEventListener("change", (event) => {
      colorBy = event.target.value;
      updateMapColor();
    });

    // Initialize chart and then show it
    leafletMap = new LeafletMap({ parentElement: '#leaflet-map', legendElement: '#map-legend'}, data, colorBy);

    timeline = new Timeline({parentElement: '#timeline'}, data);
    shapeChart = new ShapeChart({parentElement: '#shape'}, data);
    monthChart = new MonthChart({parentElement: '#month'}, data);
    timeChart = new TimeChart({parentElement: '#time'}, data);
    durationChart = new DurationChart({parentElement: '#duration'}, data);

    // Function to update the scatterplot class
    function updateMapColor() {
      leafletMap.colorBy = colorOption.value;
      leafletMap.updateVis();
    }

    visList = [timeline, shapeChart, monthChart, timeChart, durationChart];

  })
  .catch(error => console.error(error));

// listen for a custom event from html elements which contain the visualizations
// event is triggered by a brush start 
// then call for brush to be reset on every other visualization

d3.selectAll('.parent').on('brush-start', function(event){
  visList.filter(d => d.config.parentElement.slice(1) != event.srcElement.id).forEach(function(d) {d.resetBrush();});
});

d3.selectAll('.parent').on('brush-selection', function(event){
  visList.filter(d => d.config.parentElement.slice(1) != event.srcElement.id)
      .forEach(function(d) {
          d.updateFromBrush(event.detail.brushedData);
  });
});