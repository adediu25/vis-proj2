class Timeline {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
        }
        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Aggregate data by year and sort
        const sightingsByYear = d3.group(vis.data, d => d.year);
        let countsByYear = Array.from(sightingsByYear, ([year, records]) => ({year, count: records.length}));
        countsByYear = countsByYear.sort((a, b) => a.year - b.year);

        // Determine the range of years
        const minYear = d3.min(countsByYear, d => d.year);
        const maxYear = d3.max(countsByYear, d => d.year);
        const years = d3.range(minYear, maxYear + 1);

        // Set the dimensions and margins of the graph
        const margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        // Set the ranges
        const x = d3.scaleBand().range([0, width]).padding(0.1).domain(years),
            y = d3.scaleLinear().range([height, 0]);

        vis.svg = d3.select(vis.config.parentElement)
            .append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

        vis.chart = vis.svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scale the range of the data in the domains
        y.domain([0, d3.max(countsByYear, d => d.count)]);

        // Append the rectangles for the bar chart
        vis.svg.selectAll(".bar")
            .data(countsByYear)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.year))
            .attr("width", x.bandwidth())
            .attr("y", d => y(d.count))
            .attr("height", d => height - y(d.count))
            .attr("fill", "#3498db");

        // Add the x Axis
        // vis.svg.append("g")
        //     .attr("transform", `translate(0,${height})`)
        //     .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        vis.chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")).tickSize(0))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "translate(-40.5,-20)rotate(-90)")
            .attr("dx", "-.8em")
            .attr("dy", ".15em");

            vis.chart.selectAll(".domain").attr("stroke", "none");
        
        // Add the y Axis
        vis.svg.append("g")
            .call(d3.axisLeft(y));

        // Add x axis label
        vis.svg.append("text")
            .attr("transform", `translate(${width / 2 + margin.left},${height + margin.top + 25})`)
            .style("text-anchor", "middle")
            .text("Year");

        // Add y axis label
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", 0 - (height / 2) - margin.top)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number of Sightings");

        
    const tooltip = d3.select(".tooltip");

    vis.svg.selectAll(".bar")
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`${d.year} </strong><br>Sightings: ${d.count}`)
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

// class Timeline {
//     /**
//    * Class constructor with basic configuration
//    * @param {Object}
//    * @param {Array}
//    */
//   constructor(_config, _data) {
//     this.config = {
//       parentElement: _config.parentElement,
//     }
//     this.data = _data;
//     this.initVis();
//   }

//   initVis(){
//     let vis = this;

//     // Aggregate data by decade and sort
//     const sightingsByDecade = d3.group(vis.data, d => d.decade);
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

//     vis.svg = d3.select(vis.config.parentElement)
//         .append('svg')
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)

//     vis.chart = vis.svg
//         .append("g")
//         .attr("transform", `translate(${margin.left},${margin.top})`);

//     // Scale the range of the data in the domains
//     y.domain([0, d3.max(countsByDecade, d => d.count)]);

//     // Append the rectangles for the bar chart
//     vis.svg.selectAll(".bar")
//         .data(countsByDecade)
//         .enter().append("rect")
//         .attr("class", "bar")
//         .attr("x", d => x(d.decade))
//         .attr("width", x.bandwidth())
//         .attr("y", d => y(d.count))
//         .attr("height", d => height - y(d.count))
//         .attr("fill", "#3498db");

//     // Add the x Axis
//     vis.svg.append("g")
//         .attr("transform", `translate(0,${height})`)
//         .call(d3.axisBottom(x).tickFormat(d3.format("d")));

//     // Add the y Axis
//     vis.svg.append("g")
//         .call(d3.axisLeft(y));

//     // Add x axis label
//     vis.svg.append("text")
//         .attr("transform", `translate(${width / 2 + margin.left},${height + margin.top + 20})`)
//         .style("text-anchor", "middle")
//         .text("Decade");

//     // Add y axis label
//     vis.svg.append("text")
//         .attr("transform", "rotate(-90)")
//         .attr("y", 0)
//         .attr("x", 0 - (height / 2) - margin.top)
//         .attr("dy", "1em")
//         .style("text-anchor", "middle")
//         .text("Number of Sightings");

//     // Tooltip
//     const tooltip = d3.select(".tooltip");

//     vis.svg.selectAll(".bar")
//         .on("mouseover", (event, d) => {
//             tooltip.transition()
//                 .duration(200)
//                 .style("opacity", .9);
//             tooltip.html(`${d.decade}-${d.decade+5} </strong><br>Sightings: ${d.count}`)
//                 .style("left", (event.pageX - 60) + "px")
//                 .style("top", (event.pageY - 70) + "px");
//         })
//         .on("mouseout", () => {
//             tooltip.transition()
//                 .duration(500)
//                 .style("opacity", 0);
//         });
//   }
// }
