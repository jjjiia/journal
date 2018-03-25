
var width = 960,
    height = 500;

    
var scale = {
  x: d3.scaleLinear().domain([0, 1]).range([0, width]),
  y: d3.scaleLinear().domain([0, 1]).range([height, 0]),
  r: d3.scaleLinear().domain([0, 1]).range([1, 4]),
  a: d3.scaleLinear().domain([0, 1]).range([.1, .6])
};
var canvas = d3.select("#charts").append("canvas")
  .attr("width", width)
  .attr("height", height);
function drawParticles(data){



    
var particles1 = d3.range(1000)
  .map(function() {
    return {
      x: Math.random(),
      y: Math.random(),
      r: .4,
      t: .5,
      c:"rgba(255,25,5,.5)"
    };
  });
  
  var particles2 = d3.range(1000)
  .map(function() {
    return {
      x: Math.random(),
      y: Math.random(),
      r: .4,
      t: .5,
      c:"rgba(255,2,255,.5)"
    };
  });

  var particles = particles1.concat(particles2)

  var context = canvas.node().getContext("2d");

setInterval(function() {
  particles = tick(particles);
  draw(particles,context);
}, 1000);
}


function tick(particles) {
  return particles.map(function(d) {
    d.t += Math.random()*.5 - .25;
    d.x += .001*Math.cos(d.t);
    d.y += .001*Math.sin(d.t);
    d.r += Math.random()*.01 - .005;
    if (d.x < 0 || d.x > width) {
      d.x = .5;
      d.r = .1;
    }
    if (d.y < 0 || d.y > height) {
      d.y = .5;
      d.r = .1;
    }
    if (d.r <= 0) d.r = .1;
    return d;
  });
}

function draw(particles,context) {
  context.clearRect(0, 0, width, height);
  particles.forEach(function(d) {
    var x = scale.x(d.x),
        y = scale.y(d.y),
        r = scale.r(d.r),
        a = scale.a(d.r);

    context.beginPath()
    context.arc(x, y, r, 0, 2*Math.PI);
    context.fillStyle = d.c//"rgba(255, 255, 255," + a + ")";
    context.fill();
  });
}