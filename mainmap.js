import areachart from './areachart.js'
import barchart from './barchart.js'

export default function mainMap(container,usmap) {
    //margin convention

    const format = d3.format(",");

    const areaChart = areachart(".areachart")
    const barChart = barchart(".bargraph")

    const margin = ({ top: 10, right: 10, bottom: 10, left: 10 });

    const width = 600 - margin.left - margin.right;
    const height = 550 - margin.top - margin.bottom;

    const svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    
    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    
    //drawing the main map
    const features = topojson.feature(usmap, usmap.objects.states).features;

    const projection=d3.geoAlbersUsa().fitExtent(
        [[0,0],[width,height]],
        topojson.feature(usmap,usmap.objects.states)
    )
    
    var path = d3.geoPath()
             .projection(projection);
             
    svg
        .selectAll("path")
        .data(features) 
        .join("path")
        .attr("d", d=>path(d))
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
    
    svg
        .append("path")
        .datum(topojson.mesh(usmap, usmap.objects.states))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path);


    function update(data, unfiltered, crimedata) {
        /*console.log("data", data)
        console.log("unfiltered", unfiltered)
        console.log("filtered crime", crimedata)*/
        
        const colorScale = d3
             .scaleSequential(d3.interpolateReds)
             .domain(d3.extent(data, d => d.count)); 

        svg.selectAll("path")
            .data(features) 
            .style('fill',function(d){
                const state=data.find(s => s.state == d.properties.name)
                if (!state) return "white";
                return colorScale(state.count)
            })
            //tooltip
            .on("mouseover",function(event,d){
                const state=data.find(s => s.state == d.properties.name)
                const pos = d3.pointer(event, window);
                d3.select("#map-tooltip")
                    .style("left", pos[0]+20 + "px")
                    .style("top", pos[1]+10 + "px")
                    .style("opacity", 0.7);	
                    if(!state){
                        d3.select("#map-tooltip").html(
                            "State: "+d.properties.name+'<br>'
                            +"No Data"
                        )
                    }else{
                        d3.select("#map-tooltip").html(`
                        <div>State: ${d.properties.name}</div>
                        <div>Homicide Count: ${format(state.count)}</div>`
                        )
                    }
            })
            .on("mouseleave",function(d){
                d3.select("#map-tooltip").style("opacity", 0);	
            })
            .on("click", (event, d) => {
                //console.log("filtered crime", crimedata)

                let filteredState = filterByState(unfiltered, d.properties.name)
                
                const state = filteredState[0].state
                const year = data[0].year
                
                areaChart.update(filteredState)

                let filteredCrimeState = filterCrimeState(crimedata, d.properties.name)
                let crimeCountAll = countCrimes(filteredCrimeState)
                let crimeCount = crimeCountAll.slice(0, 5);
                console.log("crime count", crimeCount)

                barChart.update(crimeCount, state, year)
                
                //console.log(d.properties.name)
            })
    }

    //filter data by the year selected
    function filterByYear(data ,yearselected, unfiltered, crimedata){
        let filtered = data.filter(d => (d.year==yearselected))
        let filteredCrime = crimedata.filter(d => (d.Year == yearselected))

        update(filtered, unfiltered, filteredCrime)
        d3.select(".yearlabel")
            .html("Homicide Trends "+ yearselected + ": Click a state to start exploring")
    }

    // Filter by selected state
    function filterByState(data, stateSelected) {
        let filtered = data.filter(d=>(d.state == stateSelected));
        return filtered;
    }

    //Filter by selected state
    function filterCrimeState(data, stateSelected) {
        let filtered = data.filter(d=>(d.State == stateSelected));
        return filtered;
    }

    function countCrimes(crimes){
        var counts = {};
        for (var i = 0; i < crimes.length; i++) {
            counts[crimes[i].Weapon] = 1 + (counts[crimes[i].Weapon] || 0);
        }

        var crimeArr = []
        Object.keys(counts).forEach(function(key) {
            //console.log(key, counts[key]);
            let crime = {weapon: key, count: counts[key]}
            crimeArr.push(crime)
        });

        crimeArr.sort((a, b) => {
            return b.count - a.count;
        });

        return crimeArr
    }

    return {
        update,
        filterByYear,
    }

}