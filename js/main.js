// d3.csv('data/ufo_sightings.csv')
d3.csv('data/ufoSample.csv')
.then(data => {
    console.log(data[0]);
    // console.log(data.length);
    data.forEach(d => {
      // console.log(d);

      const [datePart, timePart] = d.date_time.split(' ');
      const [month, day, year] = datePart.split('/');
      d.year = +year;
      d.month = +month;

      d.latitude = +d.latitude; //make sure these are not strings
      d.longitude = +d.longitude; //make sure these are not strings
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

    // Function to update the scatterplot class
    function updateMapColor() {
      leafletMap.colorBy = colorOption.value;
      leafletMap.updateVis();
    }

  })
  .catch(error => console.error(error));
