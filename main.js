import mainMap from './mainmap.js'

Promise.all([
  d3.json("states.json",d3.autoType),
  d3.csv("crimedata.csv",d3.autoType),
  d3.csv("state-year-count.csv",d3.autoType)
]).then(data=>{
    let usmap =data[0]
    let crimedata = data[1]
    let stateYearCount = data[2]
    //console.log(crimedata)
    //console.log("state year count", stateYearCount)

    //initialize the map
    var yearselected = 1980;
    const mainmap = mainMap(".mainchart",usmap);

    mainmap.update(stateYearCount, stateYearCount, crimedata);
    mainmap.filterByYear(stateYearCount, yearselected, stateYearCount, crimedata)
    
    //creating a slider for year selection
    var years=d3.range(1980,2015);
    
      var timeSlider = d3
        .sliderBottom()
        .min(d3.min(years))
        .max(d3.max(years))
        .step(1)
        .width(1300)
        .tickFormat(d3.format(''))
        .tickValues(years)
        .default(1980)

      var sliderGraph = d3
        .select('.slider')
        .append('svg')
        .attr('width', 1400)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(50,30)');
    
    sliderGraph.call(timeSlider);

     //update map based on year selection
    timeSlider
        .on('onchange', val => {
          d3.select('slider').text((val))
         
          yearselected = val;
          mainmap.filterByYear(stateYearCount, yearselected, stateYearCount, crimedata)
          
        });

       
 
    
});
