// d3.csv('data/ufo_sightings.csv')
d3.csv('data/ufoSample.csv')
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
    });

    // Initialize chart and then show it
    timeline = new Timeline({parentElement: '#timeline'}, data);
    
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

    // Function to update the scatterplot class
    function updateMapColor() {
      leafletMap.colorBy = colorOption.value;
      leafletMap.updateVis();
    }

  })
  .catch(error => console.error(error));
