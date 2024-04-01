class MonthChart {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
        };
        this.data = _data.map(d => {
            const date = new Date(d.date_time); // Directly use Date constructor
            d.month = date.getMonth(); // getMonth is zero-based
            return d;
        });
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Group data by month and count the occurrences
        const monthCounts = d3.group(vis.data, d => d.month);
        let countsByMonth = Array.from(monthCounts, ([month, records]) => ({month, count: records.length}));
        countsByMonth.sort((a, b) => d3.ascending(a.month, b.month)); // Sort by month number

        // Set the dimensions and margins of the graph
        const margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        // Prepare the month names for the x-axis labels
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // Set the ranges
        const x = d3.scaleBand().range([0, width]).padding(0.1).domain(countsByMonth.map(d => monthNames[d.month])),
              y = d3.scaleLinear().range([height, 0]).domain([0, d3.max(countsByMonth, d => d.count)]);

        vis.svg = d3.select(vis.config.parentElement)
            .append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        vis.chart = vis.svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Append the rectangles for the bar chart
        vis.chart.selectAll(".bar")
            .data(countsByMonth)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(monthNames[d.month]))
            .attr("width", x.bandwidth())
            .attr("y", d => y(d.count))
            .attr("height", d => height - y(d.count))
            .attr("fill", "#3498db");

        // Add the x Axis
        vis.chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        // Add the y Axis
        vis.chart.append("g")
            .call(d3.axisLeft(y));

        // Add x axis label
        vis.svg.append("text")
            .attr("transform", `translate(${width / 2 + margin.left},${height + margin.top + 30})`)
            .style("text-anchor", "middle")
            .text("Month");

        // Add y axis label
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", 0 - (height / 2) - margin.top)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number of Sightings");

        const tooltip = d3.select(".tooltip");

        vis.chart.selectAll(".bar")
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Month: <strong>${monthNames[d.month]}</strong><br>Sightings: ${d.count}`)
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
