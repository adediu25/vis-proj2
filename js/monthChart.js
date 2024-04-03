class MonthChart {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
        };
        this.data = _data
        this.fullData = this.data;
        this.resettingBrush = false;
        this.updatingFromBrush = false;
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Group data by month and count the occurrences
        const monthCounts = d3.group(vis.data, d => d.month);
        let countsByMonth = Array.from(monthCounts, ([month, records]) => ({month, count: records.length}));
        countsByMonth.sort((a, b) => d3.ascending(a.month, b.month)); // Sort by month number

        // Set the dimensions and margins of the graph
        const margin = {top: 20, right: 20, bottom: 40, left: 60},
            width = window.innerWidth/2 - margin.left - margin.right-100,
            height = 300 - margin.top - margin.bottom;

        vis.height = height;

        // Prepare the month names for the x-axis labels
        vis.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // Set the ranges
        vis.xScale = d3.scaleBand().range([0, width]).padding(0.1).domain(countsByMonth.map(d => vis.monthNames[d.month])),
        vis.yScale = d3.scaleLinear().range([height, 0]).domain([0, d3.max(countsByMonth, d => d.count)]);

        vis.svg = d3.select(vis.config.parentElement)
            .append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        vis.chart = vis.svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        vis.brushG = vis.chart.append('g')
            .attr('class', 'brush')

        vis.brush = d3.brushX()
            .extent([[0,0], [width, height]]);

        // Add the x Axis
        vis.xAxisG = vis.chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(vis.xScale));

        // Add the y Axis
        vis.yAxisG = vis.chart.append("g")
            .call(d3.axisLeft(vis.yScale));

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
            .style('font-size', '14px')
            .text("Number of Sightings");

        vis.updateVis();
    }
    
    updateVis(){
        let vis = this;

        // Group data by month and count the occurrences
        vis.monthCounts = d3.group(vis.data, d => d.month);
        vis.countsByMonth = Array.from(vis.monthCounts, ([month, records]) => ({month, count: records.length}));
        vis.countsByMonth.sort((a, b) => d3.ascending(a.month, b.month)); // Sort by month number
    
        vis.yScale.domain([0, d3.max(vis.countsByMonth, d => d.count)])

        vis.renderVis();
    }

    renderVis(){
        let vis = this;

        // Append the rectangles for the bar chart
        vis.chart.selectAll(".bar")
            .data(vis.countsByMonth)
        .join('rect')
            .attr("class", "bar")
            .attr("x", d => vis.xScale(vis.monthNames[d.month]))
            .attr("width", vis.xScale.bandwidth())
            .attr("y", d => vis.yScale(d.count))
            .attr("height", d => vis.height - vis.yScale(d.count))
            .attr("fill", "steelblue");

        const tooltip = d3.select(".tooltip");

        const bars = vis.chart.selectAll('.bar');

        vis.chart.selectAll(".bar")
            .on("mousemove", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Month: <strong>${vis.monthNames[d.month]}</strong><br>Sightings: ${d.count}`)
                    .style("left", (event.pageX - 60) + "px")
                    .style("top", (event.pageY - 70) + "px");
            })
            .on("mouseleave", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on('mousedown', (event, d) => {
                let brush_element = vis.svg.select('.overlay').node();
                let new_event = new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    pageX: event.pageX,
                    pageY: event.pageY,
                    clientX: event.clientX,
                    clientY: event.clientY
                })
                brush_element.dispatchEvent(new_event);
            });

        vis.yAxisG.call(d3.axisLeft(vis.yScale));
        
        vis.brushG.call(vis.brush.on('end', function({selection}) {
            if (selection){
                const [x0, x1] = selection;
                bars
                    .style("fill", "lightgray")
                    .filter(d => x0 <= vis.xScale(vis.monthNames[d.month]) + vis.xScale.bandwidth() && vis.xScale(vis.monthNames[d.month]) < x1)
                    .style("fill", "steelblue")
                    .data();
            }
            else {
                bars.style("fill", "steelblue");
            }
            
            if(!vis.resettingBrush && !vis.updatingFromBrush && selection){
                const [x0, x1] = selection;

                let filteredData = vis.data.filter(d => x0 <= vis.xScale(vis.monthNames[d.month]) + vis.xScale.bandwidth() && vis.xScale(vis.monthNames[d.month]) < x1);

                d3.select(vis.config.parentElement)
                    .node()
                    .dispatchEvent(new CustomEvent('brush-selection', {detail:{
                        brushedData: filteredData
                    }}))
            }
            else if(!vis.resettingBrush && !vis.updatingFromBrush && !selection){
                d3.select(vis.config.parentElement)
                    .node()
                    .dispatchEvent(new CustomEvent('brush-selection', {detail:{
                        brushedData: vis.fullData
                    }}));
            }

        })
        .on('start', function(){
            if (!vis.resettingBrush){
                vis.data = vis.fullData;
                vis.updateVis();
                d3.select(vis.config.parentElement)
                    .node()
                    .dispatchEvent(new CustomEvent('brush-start', {}));
            }
        }));
    }

    resetBrush(){
        let vis = this;
        vis.resettingBrush = true;
        vis.brushG.call(vis.brush.clear);
        vis.updateVis();
        vis.resettingBrush = false;
    }

    updateFromBrush(brushedData){
        let vis = this;

        vis.updatingFromBrush = true;
        vis.data = brushedData;
        vis.updateVis();
        vis.updatingFromBrush = false;
        vis.data = vis.fullData;
    }
}
