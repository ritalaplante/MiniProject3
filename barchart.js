export default function barchart(container) {
    
    // Define margin convention
    const margin = {top:50, left:50, right:50, bottom:50};
    const width = 650 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = d3
        .selectAll(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // scales & axes
    const xScale = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1)

    const yScale = d3.scaleLinear()
        .range([height, 0])

    const xAxis = d3.axisBottom()
        .scale(xScale)

    const yAxis = d3.axisLeft()
        .ticks(5)
        .scale(yScale)

    // axis containers
    svg.append("g").attr("class", "axis y-axis");

    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0, ${height})`);

    const labelY = svg.append('text')
        .attr('x', -80)
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr("transform", "rotate(-90)")
        .attr('font-size', 14)
        .attr('fill', 'grey')
        .attr("font-weight", 700);

    const labelX = svg.append('text')
        .attr('x', 250)
        .attr('y', 180)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('font-size', 14)
        .attr('fill', 'grey')
        .attr("font-weight", 700);

    const title = svg.append("text")


    function update(filtered, state, year) {
        // have to make a group by function that will appropriately group the murder weapons used

        xScale.domain(filtered.map(d => d.weapon))  
	    yScale.domain([0, d3.max(filtered, d => d.count)])

        const updateBars = svg.selectAll('rect').data(filtered)

        updateBars.enter().append('rect')
            .merge(updateBars)
            .transition()
            .duration(1000)
            // in transition change x and y positions as well as height and width
            .attr('x', d => xScale(d.weapon))
            .attr('y', d => yScale(d.count))
            .attr('width', d=> xScale.bandwidth())
            .attr('height', d=>(height - yScale(d.count)))
            .attr('fill', '#bb151a')

        updateBars.exit().transition().duration(750).remove()

        // Update axes and title
        svg.select(".x-axis")
            .transition()
            .duration(1000)
            .call(xAxis);

        svg.select(".y-axis")
            .transition()
            .duration(1000)
            .call(yAxis);
        
        title.attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(function(){ return "Weapons Most Frequently Used: "+ state + ", " + year; })
            .attr("font-weight", 700)
            .attr('fill', 'grey');

        labelY.text("Homicides")

        labelX.text("Weapon Used")
    }
    
    return {
        update
    }

}