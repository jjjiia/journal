    //DRAW MAP AND USE FLY TO ANIMATION TO LOAD CENSUS IDS
    //DRAW GRAPH
    //CLICK A BUTTON FOR SUMMARY VIEW - EXPLORE 5 DIFFERENT ONES
        //LINE - 
                //SMALL MULTIPLE
                //STACKED COMBOS
        //RADAR - 
                //SMALL MULTIPLE
                //STACKED COMBOS
        //ELEMENT - ANIMAL LIKE - FLOWER
        //SPACE - PARTICLE LIKE
        //SEDIMENTATION
    //ADD CALENDAR LATER TO INTERACT WITH DIFFERENT SUMMARY VIEWS

//https://www.mapbox.com/mapbox-gl-js/example/polygon-popup-on-click/
$(function() {
  	queue()
      .defer(d3.csv,"R11637956_SL150.csv")
      .defer(d3.json,"R11637956.json")
     .defer(d3.csv,"places_2weeks.csv")
      .await(dataDidLoad);
  })
var lineCount = 0
var colors = ["#dd8d64","#4bf094","#e7b02c","#50a633","#1bcb78","#e28327","#4f7f32","#d64728","#37a6a8","#d26140","#339762","#46a78d","#8de3be"]
    var  pan =false
var dataDictionary = null
var censusByGid =null
  var gidsMaster = []
  var filteredCensusData = {}
var valueCategories = ["T012_001","T012_002","T012_003","T057_001"]//not percents 
function dataDidLoad(error,censusData,dataDictionaryFile,moves){
  //  console.log(moves)
    dataDictionary = dataDictionaryFile
    //    var calendar = formatRoute(moves)
    //    console.log(calendar)
    
    censusByGid = formateByGid(censusData)
    
    var sortedByTime = moves.sort(function(a,b){
        return new Date(a.Start) - new Date(b.Start)
    })
   // console.log(sortedByTime)
    
    
drawMap(sortedByTime) 
   // drawMap(sortedByTime)
   // getGids(sortedByTime)
}
function formateByGid(censusData){
    var formatted = {}
    for(var i in censusData){
        var entry = censusData[i]
        if(entry["Geo_GEOID"]!=undefined){
            var gid = entry["Geo_GEOID"]//.split("US")[1]
            formatted[gid]=entry
        }
    }
    return formatted
}

function drawMap(data){
    var startPoint = [data[0].Longitude,data[0].Latitude]
    //FOR EACH latlng, CYCLE THROUGH, ADD POINT/LINE, FLY TO IT
    
    mapboxgl.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jjjiia123/cjee9milq3glo2qqqo5ohxp37',
        center: startPoint,
        zoom:12
    });
        var coordsList = []
        var features = []
        var censusFeatures = []
    
    map.on('load', function() {    
        var xy = map.project(startPoint)
        var startGid = map.queryRenderedFeatures(xy,{layers:["blockGroup"]})[0]["properties"]["AFFGEOID"].replace("00000US","000US")
        var censusStart = censusByGid[startGid]
        filteredCensusData = censusStart
        setupChart(censusStart)        
        //for(var i in data){
        //    if(isNaN(data[i].Longitude)==false && i!=0){
        //        console.log(coordsList.length)
        //        
        //        var coords = [parseFloat(data[i].Longitude),parseFloat(data[i].Latitude)]
        //        var xy = map.project(coords)
        //        var feature = map.queryRenderedFeatures(xy,{layers:["blockGroup"]})
        //        //["properties"]["AFFGEOID"]
        //        coordsList.push(coords)   
        //    }
        //    
        //}
      //  console.log(censusByGid)
        //var bounds = coordsList.reduce(function(bounds, coord) {
        //        return bounds.extend(coord);
        //    }, new mapboxgl.LngLatBounds(coordsList[0], coordsList[0]));
        //
        //map.fitBounds(bounds, {
        //        padding: 10
        //});
        //
      //  animateMap(data,0,map,coordsList,features,censusFeatures)
    })
}

function recordPoints(data,map){
    console.log(map.getStyle().layers)
    var gids = []
    var coordsList = []
    
    for(var i in data){
        var coords = [data[i].Longitude,data[i].Latitude]
        coordsList.push(coords)
        var xy = map.project(coords)
        var feature = map.queryRenderedFeatures(xy,{layers:["blockGroup"]})
     //   console.log(feature)
        
        
        //var gid = feature[0].properties["AFFGEOID"]
        //gids.push(gid)
    }
//console.log(gids)
    
//    addPaths(coordsList,map,"x")
}

function animateMap(data,count,map,coordsList,features,censusFeatures){
    //    console.log(data.length)
    if (count < data.length-1){
        map.removeLayer("path_base_"+count)
      
        count+=1
        addPaths(coordsList,map,count)        
        var coords = [parseFloat(data[count].Longitude),parseFloat(data[count].Latitude)]  
        coordsList.push(coords)
        map.flyTo({  
            center: coords,
            speed: .1
        });
        map.once('moveend', function(){            
            var xy = map.project(coords)
            var feature = map.queryRenderedFeatures(xy,{layers:["blockGroup"]})
            if(feature[0]!=undefined){
                var gid = feature[0]["properties"]["AFFGEOID"].replace("00000US","000US")
                var duration = data[count].Duration
                
                if(features.indexOf(gid)>-1){
                    var censusEntry = censusByGid[gid]
                    censusEntry["duration"]+=parseInt(duration)
                    
                }else{
                    features.push(gid)
                    var censusEntry = censusByGid[gid]
                    censusEntry["duration"]=duration
                    updateCharts(censusEntry)
                }
  
                //console.log(filteredCensusData)
            }
//            console.log(data[count])
           // console.log(gid)
           // drawBubbles(censusEntry)            
            //drawParticles(censusEntry)
            
           // animateMap(data,count,map,coordsList,features,censusFeatures)
            
        });
     //  console.log([count,data[count],features.length])
    }    
}
function updateCharts(censusEntry){
//    console.log(censusEntry)
//    console.log(filteredCensusData)   
    var width = 500
    var margin = 20
    var updated = {}
    
    for(var i in filteredCensusData){
        if(String(i).indexOf("SE_")>-1){
            filteredCensusData[i]=parseInt(filteredCensusData[i])+parseInt(censusEntry[i])
        }
    }
    var groupedData = groupByTable(filteredCensusData)
 //   console.log(groupedData)
    var tables = {
    "T007":"Age","T004":"Sex",
    "T013":"Race",
    "T056":"Household Income",
    "T129":"Travel Time to Work",
    "T128":"Means of Transportation",
    "T033":"Employment Status",
    "T056":"Household Income",
    "T193":"Year Structure Built",
    "T025":"Education"}

    for(var t in tables){
       // console.log(t)
        var tableData = groupedData[t]
        var range = d3.extent(Object.values(tableData));
        var x = d3.scaleLinear().domain([0,range[1]]).range([0,width-margin*8])
        d3.selectAll(".axis_"+t).transition()
            .call(d3.axisBottom(x));

        for(var c in tableData){
            d3.select("."+c).transition().duration(1000).attr("width",x(filteredCensusData[c]))
        }
    }  
}


function setupChart(censusEntry){
    
    var groupedData = groupByTable(censusEntry)
    var tables = {"T004":"Sex",
    "T007":"Age",
    "T013":"Race",
    "T056":"Household Income",
    "T129":"Travel Time to Work",
    "T128":"Means of Transportation",
    "T033":"Employment Status",
    "T056":"Household Income",
    "T193":"Year Structure Built",
    "T025":"Education"}
    
    for(var t in tables){
        var tableData = groupedData[t]
       // drawChart(tableData,t)
        drawBubbles(tableData)
        
        
    }  
}
function drawBubbles(data){
    var width = $("#charts").innerWidth();
    var height = 400;
    var center = { x: width / 2, y: height / 2 };
    var forceStrength = .1;
    var svg = null;
    var bubbles = null;
    var nodes = [];
    function charge(d) {return -Math.pow(d.radius, 2.1) * forceStrength;}
    var simulation = d3.forceSimulation()
        .velocityDecay(0.2)
        .force('x', d3.forceX().strength(forceStrength).x(center.x))
        .force('y', d3.forceY().strength(forceStrength).y(center.y))
        .force('charge', d3.forceManyBody().strength(charge))
        .on('tick', ticked);
    simulation.stop();
    
    function ticked() {
        bubbles
          .attr('cx', function (d) { return d.x; })
          .attr('cy', function (d) { return d.y; });
      }
      
      nodes = createNodes(data);
      svg = d3.select("#charts")
        .append('svg')
        .attr('width', width)
        .attr('height', height);
      bubbles = svg.selectAll('.bubble')
        .data(nodes, function (d) { return d.id; });
      var bubblesE = bubbles.enter().append('circle')
        .classed('bubble', true)
        .attr('r', 0)
        .attr('fill', function (d,i) { return colors[i%(colors.length-1)]; })
        .attr('stroke', function (d,i) { return colors[i%(colors.length-1)]; })
        .attr('stroke-width', 2)
        bubbles = bubbles.merge(bubblesE);
      bubbles.transition()
        .duration(2000)
        .attr('r', function (d) { return d.radius; });
      simulation.nodes(nodes);
      simulation.alpha(1).restart();
}
function createNodes(fileData) {
    var range = d3.extent(Object.values(fileData));
    var radiusScale = d3.scalePow()
    //.exponent(1)//0.5)
      .range([2, 85])
      .domain([0, range[1]]);
      var myNodes = Object.keys(fileData).map(function (d) {
     //     console.log(d)
      console.log(fileData[d])
      return {
        id: d,
        radius: radiusScale(fileData[d]),
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });
    return myNodes;
}

function drawChart(data,table){
    var bar = 20//(height-margin*#)/(Object.keys(data).length)
    //var width = $("#charts").innerWidth()
    var width = 500
    var margin = 20
    var height = bar*Object.keys(data).length+margin*2
//    console.log(height)
    var svg = d3.select("#charts").append("svg").attr("width",width).attr("height",height)
    var range = d3.extent(Object.values(data));
  //  console.log(range)
    var x = d3.scaleLinear().domain([0,range[1]]).range([0,width-margin*8])
    
    var tables = {"T004":"Sex",
    "T007":"Age",
    "T013":"Race",
    "T056":"Household Income",
    "T129":"Travel Time to Work",
    "T128":"Means of Transportation",
    "T033":"Employment Status",
    "T056":"Household Income",
    "T193":"Year Structure Built",
    "T025":"Education"}
    
    svg.append("text").text(tables[table]).attr("x",margin).attr("y",margin)

    var chart = svg.selectAll("."+table).append("g")
                    .data(Object.keys(data))
                    .enter()
                    .append("rect")
                    .attr("class",function(d){return d})
                    .attr("y",function(d,i){
                        return i*bar
                    })
                    .attr("x",function(d,i){
                        return 0
                        return height- x(parseInt(data[d]))
                    })
                    .attr("height",bar*.9)
                    .attr("width",function(d){
                        return x(parseInt(data[d]))
                    })
                    .attr("transform","translate("+margin*8+","+margin+")")
    var label = svg.selectAll("."+table).append("g")
                    .data(Object.keys(data))
                    .enter()
                    .append("text")
                    .attr("y",function(d,i){
                        return i*bar+bar/2
                    })
                    .attr("text-anchor","end")
                    .attr("x",function(d,i){
                        return 0
                        return height- x(parseInt(data[d]))
                    })
                    .text(function(d){
                        return dataDictionary[d.replace("SE_","")]
                        return d
                    })
                    .attr("transform","translate("+(margin*8-5)+","+margin+")")
                    .style("font-size",10)
  svg.append("g").attr("class","axis_"+table)
      .call(d3.axisBottom(x))
      .attr("transform", "translate("+(margin*8)+"," + (height-margin )+ ")")
}
function groupByTable(censusEntry){
    var grouped = {}
    for(var i in censusEntry){
        var code = String(i)
        if(code.indexOf("SE_")>-1 &&code.split("_")[2]!="001"){
            var tableKey = code.split("_")[1]
            var groupedKeys = Object.keys(grouped)
            
            
            if(groupedKeys.indexOf(tableKey)>-1){
                grouped[tableKey][code]=parseInt(censusEntry[code])
            }else{
                grouped[tableKey]={}
                grouped[tableKey][code]=parseInt(censusEntry[code])
            }
        }
    }
    return grouped
}

function addPaths(coordsList,map,count){
   
    map.addLayer({
    "id": "path_base_"+count,
            "type": "line",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": coordsList
                    }
                }
            },
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": "rgba(255,0,0,.2)",
                "line-width": 6
            }
    })
    
}

function drawCalendar(data){
    console.log(Object.keys(data))  
}
function formatRoute(moves){
    var dictionary = {}
    for(var i in moves){
        if(i!="columns"){
            var entry = moves[i]
            var date = entry["Date"]        
            var start = entry["Start"].split("T")[1]
            var end = entry["End"].split("T")[1]
            var lat = entry["Latitude"]
            var lng = entry["Longitude"]
        
            if(Object.keys(dictionary).indexOf(date)>-1){
                dictionary[date].push({"start":start,"end":end,"lat":lat,"lng":lng})
            }else{
                dictionary[date]=[]
                dictionary[date].push({"start":start,"end":end,"lat":lat,"lng":lng})
            }
        }
    }
    return dictionary
}

function drawDirections(mouseList,map){   
    map.addLayer({
    "id": "mouse_"+lineCount,
            "type": "line",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": mouseList
                    }
                }
            },
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color":  colors[lineCount%(colors.length-1)],
                "line-opacity":.4,
                "line-width": 4
            }
    })
    var start = mouseList[0]
    var end =  mouseList[mouseList.length-1]
    map.addSource("points_"+lineCount,{
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": start
                },
                "properties":{
                    "title":"A"
                }
            },{
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates":end
                },
                "properties":{
                    "title":"B"
                }
            }]
        }
    });
    map.addLayer({
            "id": "start_"+lineCount,
            "type": "circle",
            "source": "points_"+lineCount,
            "paint": {
                "circle-radius": 3,
                "circle-color": colors[lineCount%(colors.length-1)],
            },
            "filter": ["==", "$type", "Point"],
        });
    map.addLayer({
        "id":"start_label_"+lineCount,
        "type":"symbol",
        "source": "points_"+lineCount,
        "layout":{
            "text-field":"{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top",
        },
        "paint":{
            "text-color":colors[lineCount%(colors.length-1)]
        }
    })
    
}

function recordMouse(map,mouseList,e){
    mouseList.push([e.lngLat.lng,e.lngLat.lat])
    return mouseList
}
function getDistance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
	return dist
}

function getDistances(pathDataId){
    var totalDistance = 0
    var distanceDictionary = {}
    for(var i =0; i <pathDataId.length-1; i++){
        
        if(i<pathDataId.length){
        //    console.log(i)
      //  console.log(pathDataId[parseInt(i+1)])
            var gid1 = pathDataId[i][0]
            var gid2 =pathDataId[i+1][0]
            var coord1 = pathDataId[i][1]
            var coord2 = pathDataId[i+1][1]
            //console.log([i,coord1,coord2])
            var d = getDistance(coord1[1],coord1[0],coord2[1],coord2[0])
            totalDistance+=d
            distanceDictionary[gid2]=totalDistance
        }
    }
    distanceDictionary[pathDataId[0][0]]=0
    distanceDictionary["total"]=totalDistance
    return distanceDictionary
}
function drawPath(data,geoids,map){
    var pathData = []
    var pathDataId = []
    for(var g in geoids){
            var gid = geoids[g].replace("1500000US","15000US")
        if(data[gid]!=undefined && data[gid]!=0){
            var coords = [parseFloat(data[gid].lng),parseFloat(data[gid].lat)]
            pathData.push(coords)
            pathDataId.push([gid,coords])
        }
    }
    var distances = getDistances(pathDataId)
    
    
    for(var k in dataDictionary){
    //    console.log(k)
        var title = dataDictionary[k]
   //     console.log([title,k])
       // drawChart(distances,data,geoids,"SE_"+k,map)
    }
    
    map.addLayer({
    "id": "route_"+lineCount,
            "type": "line",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": pathData
                    }
                }
            },
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": colors[lineCount%(colors.length-1)],
                "line-width": 1
            }
    })
    
    
    var features = []
    for(var i in pathData){
        features.push({
            "type":"Feature",
            "geometry":{"type":"Point","coordinates":pathData[i]},
            "properties":{"title":"centroid_"+lineCount+"_"+i}
        })
    }
    var centroidsSource = {"type":"geojson","data":{"type":"FeatureCollection","features":features}}
    //console.log(centroidsSource)
    map.addSource('centroids_'+lineCount,centroidsSource)
    
    map.addLayer({
            "id": "centroids_"+lineCount,
            "type": "circle",
            "source": "centroids_"+lineCount,
            "paint": {
                "circle-radius": 4,
                "circle-color": colors[lineCount%(colors.length-1)],
            },
            "filter": ["==", "$type", "Point"],
        });  
}

/*function drawChart(distances,data,geoids,column,map){
    
           var height = $('#charts').height();
           if($(this).is(':visible')){
               $("#charts").scrollTo(height);
           }
    
    //    map.on('click', 'blockgroup', function (e) {
    //           new mapboxgl.Popup()
    //               .setLngLat(e.lngLat)
    //               .setHTML(e.features[0].properties.name)
    //               .addTo(map);
    //               console.log(e)
    //       });
    
    //    d3.selectAll("#charts svg").remove()
    var margin = 30
    var height = 80
    var width = 250
    
    
    var svg = d3.select("#charts").append("svg").attr("width",width+margin*3).attr("height",height+margin*2).attr("class","chart_"+lineCount)
    
    
    var title = dataDictionary[column.replace("SE_","")]
    svg.append("text").text(title).attr("x",10).attr("y",20)
    
    svg.append("text").text(Math.round(distances.total*100)/100+" mi").attr("x",width/2+margin).attr("y",height+margin)
    svg.append("text").text("A").attr("x",margin*2).attr("y",height+margin).style("fill",colors[lineCount%(colors.length-1)])
    svg.append("text").text("B").attr("x",margin*2+width).attr("y",height+margin).style("fill",colors[lineCount%(colors.length-1)])



    svg.append("circle").attr("cx",margin*2+width).attr("cy",10).attr("r",8).style("stroke","#000").attr("fill","#fff").attr("class","chart_"+lineCount)
    svg.append("text").html("&#10005").attr("x",margin*2+width-5).attr("y",15).style("fill","#000").attr("class","chart_"+lineCount)
    .on("click",function(){
        var className = d3.select(this).attr("class")
        var lineClass = className.split("_")[1]
        d3.select("."+className).remove()
        map.removeLayer("centroids_"+lineClass)
        map.removeLayer("route_"+lineClass)
        map.removeLayer("start_"+lineClass)
        map.removeLayer("start_label_"+lineClass)
        map.removeLayer("mouse_"+lineClass)
        map.setFilter("bg-highlighted", ["==", "AFFGEOID", ""]);                    
        
        
    })

    var filteredData = []
    
    for(var geoid in geoids){
        var gid = geoids[geoid].replace("1500000US","15000US")
        if(data[gid]!=undefined){
            var value = data[gid][column]
            if(value>0){
                filteredData.push([gid,value])
            }   
        }
    }

    var g = svg.append("g").attr("transform", "translate(" + margin*2 + "," + margin + ")");
  //  console.log(geoids)
    var max = d3.max(geoids.map(function(d){
        if(data[d.replace("1500000US","15000US")]!=undefined){
          //  console.log(data[d.replace("1500000US","15000US")])
            return parseFloat(data[d.replace("1500000US","15000US")][column])
        }
    }))
    //    console.log(max)
    var y = d3.scaleLinear()
        .domain([0,max])
        .rangeRound([height-10, 0]);
    var x = d3.scaleLinear()
        .domain([0,distances.total])
        .range([0,width])
    var barWidth = (width-10)/geoids.length
    //y.domain(d3.extent(data, function(d) { return d[column]; }));

    var line = d3.line()
        .x(function(d,i){ 
            //var id = d.replace("1500000US","15000US")
            return x(distances[d[0]])
            //return x(distances[id])
        })
        .y(function(d,i){
                return y(d[1])
        })
        g.append("path")
            .datum(filteredData)
            .attr("fill", "none")
            .attr("stroke",colors[lineCount%(colors.length-1)])
            .attr("stroke-linejoin", "round")
            .attr("d",line)
    
      var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) { return "$"+d[1]; });
      svg.call(tool_tip);

      g.selectAll("circle .rollover")
          .data(filteredData)
          .enter()
          .append("circle")
          .attr("fill","red")
          .attr("opacity",0)
          .attr("cy",function(d){
              return y(d[1])
          })
          .attr("class",function(d){
              return "rollover rollover_"+d[0]})
          .attr("cx",function(d,i){
            return x(distances[d[0]])
          })
          .attr('r',7)
          .on('mouseover', function(d){
              tool_tip.html("$"+d[1])
              tool_tip.show()
              d3.select(this).attr("opacity",.6)
              map.setFilter("bg-hover-highlight", ["==",  "AFFGEOID", d[0].replace("15000US","1500000US")]);
          })
          .on('mouseout', function(d){
              d3.select(this).attr("opacity",0)
              map.setFilter("bg-hover-highlight", ["==",  "AFFGEOID", ""]);
              tool_tip.hide()
          });
          
      g.selectAll("circle .first")
          .data(filteredData)
          .enter()
          .append("circle")
          .attr("fill",colors[lineCount%(colors.length-1)])
          .attr("cy",function(d){
              return y(d[1])
          })
          .attr("cx",function(d,i){
            return x(distances[d[0]])
          })
          .attr("class",function(d){return "_"+d[0]})
          .attr('r',3)
          .on('mouseover', function(d){
              tool_tip.html("$"+d[1])
              tool_tip.show()
              d3.select(this).attr("opacity",.6)
              map.setFilter("bg-hover-highlight", ["==",  "AFFGEOID", d[0].replace("15000US","1500000US")]);
          })
          .on('mouseout', function(d){
              d3.select(this).attr("opacity",0)
              map.setFilter("bg-hover-highlight", ["==",  "AFFGEOID", ""]);
              tool_tip.hide()
          });
     g.append("g")
          .call(d3.axisLeft(y).ticks(4))
        //.append("text")
        //  .attr("fill", "#000")
        //  .attr("transform", "rotate(-90)")
        //  .attr("y", -60)
        //  .attr("x", -50)
        //  .attr("dy", "0.71em")
        //  .attr("text-anchor", "middle")
        //  .text("");
}*/
function convertDataToDict(censusData){
    var formatted = {}
    for(var i in censusData){
        var geoid = censusData[i]["Geo_GEOID"]
        formatted[geoid]=censusData[i]
    }
    return formatted
}
function getFeatures(e,map,featureList){
     console.log(e)
    var features = map.queryRenderedFeatures(e.point,{layers:["blockGroup"]});
     // console.log(features)
      var geoids=[]
      for(var f in featureList){
          var fid = featureList[f].properties["AFFGEOID"].replace("1500000US","15000US")
          geoids.push(fid)
      }
        //              document.getElementById('features').innerHTML = JSON.stringify(features, null, 2);
        var feature = features[0]
        if(feature!=undefined){
            var geoid = feature.properties["AFFGEOID"].replace("1500000US","15000US")
            if(geoids.indexOf(geoid)==-1){
                geoids.push(geoid)
                featureList.push(feature)
            }
        }
        //if(geoidList.indexOf(geoid)==-1){
        //    geoidList.push(geoid)
        //}
        return featureList
}
function addPolygons(map,geoids){
    var filter = ["in","AFFGEOID"].concat(geoids);
    map.setFilter("bg-hover-highlight", filter);           
  //  map.setPaintProperty("bg-hover-highlight","fill-color",colors[lineCount%(colors.length-1)])
  //  map.setPaintProperty("bg-hover-highlight","fill-opacity",.3)
   // map.setFilter("bg-highlighted", ["==", "AFFGEOID", ""]);                    
//    map.setFilter("bg-hover", ["==", "AFFGEOID", ""]);                    
}