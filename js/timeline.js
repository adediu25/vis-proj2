class Timeline {
    /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
    }
    this.data = _data;
    this.initVis();
  }

  initVis(){
    let vis = this;

    // Aggregate data by decade and sort
    const sightingsByDecade = d3.group(vis.data, d => d.decade);
    let countsByDecade = Array.from(sightingsByDecade, ([decade, records]) => ({decade, count: records.length}));
    countsByDecade = countsByDecade.sort((a, b) => a.decade - b.decade); // Ensure sorted by decade

    // Determine the range of decades
    const minDecade = d3.min(countsByDecade, d => d.decade);
    const maxDecade = d3.max(countsByDecade, d => d.decade);
    const decades = Array.from(new Array((maxDecade - minDecade) / 5 + 1), (val, index) => minDecade + index * 5);

    // Set the dimensions and margins of the graph
    const margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Set the ranges
    const x = d3.scaleBand().range([0, width]).padding(0.1).domain(decades),
        y = d3.scaleLinear().range([height, 0]);

    vis.svg = d3.select(vis.config.parentElement)
        .append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    vis.chart = vis.svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scale the range of the data in the domains
    y.domain([0, d3.max(countsByDecade, d => d.count)]);

    // Append the rectangles for the bar chart
    vis.svg.selectAll(".bar")
        .data(countsByDecade)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.decade))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.count))
        .attr("height", d => height - y(d.count));

    // Add the x Axis
    vis.svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Add the y Axis
    vis.svg.append("g")
        .call(d3.axisLeft(y));

    // Tooltip
    const tooltip = d3.select(".tooltip");

    vis.svg.selectAll(".bar")
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Sightings: ${d.count}`)
                .style("left", (event.pageX - 60) + "px")
                .style("top", (event.pageY - 70) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
  }
}



// // Load and parse the dataset
// d3.csv("data/ufo_sightings.csv").then(data => {
//     data.forEach(d => {
//         d.date_time = parseTime(d.date_time);
//         // Group into 10-year intervals by rounding down the year
//         d.decade = Math.floor(d.date_time.getFullYear() / 5) * 5;
//     });

//     // Aggregate data by decade and sort
//     const sightingsByDecade = d3.group(data, d => d.decade);
//     let countsByDecade = Array.from(sightingsByDecade, ([decade, records]) => ({decade, count: records.length}));
//     countsByDecade = countsByDecade.sort((a, b) => a.decade - b.decade); // Ensure sorted by decade

//     // Determine the range of decades
//     const minDecade = d3.min(countsByDecade, d => d.decade);
//     const maxDecade = d3.max(countsByDecade, d => d.decade);
//     const decades = Array.from(new Array((maxDecade - minDecade) / 5 + 1), (val, index) => minDecade + index * 5);

//     // Set the dimensions and margins of the graph
//     const margin = {top: 20, right: 20, bottom: 30, left: 40},
//         width = 960 - margin.left - margin.right,
//         height = 500 - margin.top - margin.bottom;

//     // Set the ranges
//     const x = d3.scaleBand().range([0, width]).padding(0.1).domain(decades),
//         y = d3.scaleLinear().range([height, 0]);

//     const svg = d3.select("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         .attr("transform", `translate(${margin.left},${margin.top})`);

//     // Scale the range of the data in the domains
//     y.domain([0, d3.max(countsByDecade, d => d.count)]);

//     // Append the rectangles for the bar chart
//     svg.selectAll(".bar")
//         .data(countsByDecade)
//         .enter().append("rect")
//         .attr("class", "bar")
//         .attr("x", d => x(d.decade))
//         .attr("width", x.bandwidth())
//         .attr("y", d => y(d.count))
//         .attr("height", d => height - y(d.count));

//     // Add the x Axis
//     svg.append("g")
//         .attr("transform", `translate(0,${height})`)
//         .call(d3.axisBottom(x).tickFormat(d3.format("d")));

//     // Add the y Axis
//     svg.append("g")
//         .call(d3.axisLeft(y));

//     // Tooltip
//     const tooltip = d3.select(".tooltip");

//     svg.selectAll(".bar")
//         .on("mouseover", (event, d) => {
//             tooltip.transition()
//                 .duration(200)
//                 .style("opacity", .9);
//             tooltip.html(`Sightings: ${d.count}`)
//                 .style("left", (event.pageX - 60) + "px")
//                 .style("top", (event.pageY - 70) + "px");
//         })
//         .on("mouseout", () => {
//             tooltip.transition()
//                 .duration(500)
//                 .style("opacity", 0);
//         });
// });
