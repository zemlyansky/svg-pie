(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['d3'], factory)
    } else if (typeof module === 'object' && module.exports) {
        var d3 = Object.assign({},
          require('d3-scale'),
          require('d3-selection'),
          require('d3-shape')
        )
        module.exports = factory(d3)
    } else {
        root.SvgPie  = factory(root.d3)
    }
}(this, function (d3) {

  return function SvgPie(selector, userOptions) {
    var chart = d3.select(selector)

    chart.style('position', 'relative')
         .style('display', 'flex')
         .style('justify-content','center')
         .style('align-items','center')

    var defaultOptions = {
      innerRadiusSize: .7,
      legend: true
    }

    var options = Object.assign(defaultOptions, userOptions)
    var color = d3.scaleOrdinal(d3.schemeCategory10)
    var svg = d3.select(selector)
                .append('svg')
                .style('position','absolute')
                .style('top','0')
                .style('left','0')
    var g = svg.append('g')

    var pieGenerator = d3.pie()
                         .value(function(d) {return d.value})
                         .sort(null)
    var tooltip

    if (options.legend) {
      var tooltip = chart
                     .append('div')
                     .attr('class','tooltip')
                     .style('position','absolute')
      tooltip.append('span')
                     .attr('class','tooltip-value')
    }

    this.update = function() {
      var containerWidth = parseInt((chart.style('width')))
      var width = containerWidth
      var height = (containerWidth > 600) ? containerWidth / 2 : containerWidth
      var outerRadius = Math.min(width, height) / 2
      var innerRadius = outerRadius * options.innerRadiusSize
      var arc = d3.arc()
                  .innerRadius(innerRadius)
                  .outerRadius(outerRadius)

      chart.style('height', height + 'px')
      svg.attr('width', width)
         .attr('height', height)

      g.attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')')

      var path = g.selectAll('path')
                  .data(pieGenerator(options.dataset))

      var updPath = path.enter()
                  .append('path')
                .merge(path)
                  .attr('d', arc)
                  .attr('fill', function(d, i) {
                    return color(d.data.label)
                  })
                  if (options.legend) {
                    updPath.on('mouseover', function(d) {
                      tooltip.style('display','block')
                            .select('.tooltip-value')
                            .text(d.value)
                    })
                    updPath.on('mousemove', function(d) {
                      tooltip
                            .style('top', (d3.event.layerY + 10) + 'px')
                            .style('left', (d3.event.layerX + 10) + 'px');
                    })
                    updPath.on('mouseout', function(d) {
                      tooltip.style('display', 'none')
                    })
                  }

    } //End of draw

    this.update()
    d3.select(window).on('resize', this.update);
  } // End of SvgPie constructor
})) // End of factory
