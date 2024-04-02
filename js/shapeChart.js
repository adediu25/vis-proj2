class ShapeChart {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
        };
        this.data = _data;
        this.fullData = this.data;
        this.resettingBrush = false;
        this.updatingFromBrush = false;
        this.initVis();
    }
  
    initVis() {
        let vis = this;
  
        // Group data by UFO shape and count the occurrences
        const ufoShapeCounts = d3.group(vis.data, d => d.ufo_shape);
        let countsByShape = Array.from(ufoShapeCounts, ([shape, records]) => ({shape, count: records.length}));
        countsByShape.sort((a, b) => d3.descending(a.count, b.count)); // Sort shapes by count
  
        // Set the dimensions and margins of the graph
        const margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
  
        // Set the ranges
        vis.xScale = d3.scaleBand().range([0, width]).padding(0.1).domain(countsByShape.map(d => d.shape)),
        vis.yScale = d3.scaleLinear().range([height, 0]).domain([0, d3.max(countsByShape, d => d.count)]);
  
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
  
        // Append the rectangles for the bar chart
        vis.chart.selectAll(".bar")
            .data(countsByShape)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => vis.xScale(d.shape))
            .attr("width", vis.xScale.bandwidth())
            .attr("y", d => vis.yScale(d.count))
            .attr("height", d => height - vis.yScale(d.count))
            .attr("fill", "steelblue");
  
        // Add the x Axis
        vis.chart.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(vis.xScale))
        .selectAll("text")
            .style("text-anchor", "end") 
            .attr("dx", "-.8em") 
            .attr("dy", ".15em") 
            .attr("transform", "rotate(-90)"); ;
            // Add the y Axis
            vis.chart.append("g")
                .call(d3.axisLeft(vis.yScale));
  
      // Add x axis label
        vis.svg.append("text")
          .attr("transform", `translate(${width / 2 + margin.left},${height + margin.top + 30})`)
          .style("text-anchor", "middle")
          .text("Shape");
  
      // Add y axis label
        vis.svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0)
          .attr("x", 0 - (height / 2) - margin.top)
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Number of Sightings");
  
        vis.updateVis();
    }

    updateVis(){
        let vis = this;
    
        vis.renderVis();
    }

    renderVis(){
        let vis = this;

        const tooltip = d3.select(".tooltip");

        const bars = vis.chart.selectAll('.bar');

        vis.chart.selectAll(".bar")
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Shape: <strong>${d.shape}</strong><br>Sightings: ${d.count}`)
                    .style("left", (event.pageX - 60) + "px")
                    .style("top", (event.pageY - 70) + "px");
            })
            .on("mouseout", () => {
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
        
        vis.brushG.call(vis.brush.on('end', function({selection}) {
            if (selection){
                const [x0, x1] = selection;
                bars
                    .style("fill", "lightgray")
                    .filter(d => x0 <= vis.xScale(d.shape) + vis.xScale.bandwidth() && vis.xScale(d.shape) < x1)
                    .style("fill", "steelblue")
                    .data();
            }
            else {
                bars.style("fill", "steelblue");
            }
            
            if(!vis.resettingBrush && !vis.updatingFromBrush && selection){
                const [x0, x1] = selection;

                let filteredData = vis.data.filter(d => x0 <= vis.xScale(d.shape) + vis.xScale.bandwidth() && vis.xScale(d.shape) < x1);

                d3.select(vis.config.parentElement)
                    .node()
                    .dispatchEvent(new CustomEvent('brush-selection', {detail:{
                        brushedData: filteredData
                    }}))
            }

        })
        .on('start', function(){
            if (!vis.resettingBrush){
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