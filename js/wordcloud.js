class WordCloud {
    constructor(_config, _invertedIndex) {
        this.config = {
            parentElement: _config.parentElement,
            width: 500,
            height: 500
        }
        this.invertedIndex = _invertedIndex;
        this.initVis();
    }

    initVis() {
        this.draw();
    }

    draw() {
        let words = Object.keys(this.invertedIndex).map(word => {
            // Filtering out words with less than 3 letters
            if (word.length <= 3) return null;
    
            let docs = this.invertedIndex[word];
            return {
                text: word,
                size: docs.length, // Frequency is the length of the array
                indexes: docs // The document indexes
            };
        }).filter(word => word !== null); // Remove any null entries from the array
    
        words.sort((a, b) => b.size - a.size);
    
        this.layout = d3.layout.cloud()
            .size([this.config.width, this.config.height])
            .words(words)
            .padding(5)
            .rotate(() => 0)
            .font("Impact")
            .fontSize(d => d.size) // Adjust the size as needed
            .on("end", this.drawWords.bind(this));
    
        this.layout.start();
    }
    

    drawWords(words) {
        d3.select(this.config.parentElement).append("svg")
            .attr("width", this.layout.size()[0])
            .attr("height", this.layout.size()[1])
            .append("g")
            .attr("transform", "translate(" + this.layout.size()[0] / 2 + "," + this.layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", d => d.size + "px")
            .style("font-family", "Impact")
            .attr("text-anchor", "middle")
            .attr("transform", d => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
            .text(d => d.text)
            .on("click", d => { 
                console.log("Clicked word: " + d.text); 
                console.log("Indexes: " + d.indexes.join(', ')); // Print the indexes when a word is clicked
            });
    }
}
