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
    // Default options
    // Merged later with user options
    var defaultOptions = {
      innerRadiusSize: .7,
      legend: true
    }
    this.options = Object.assign(defaultOptions, userOptions)

    // Select chart element
    var chart = d3.select(selector)
                  .style('position', 'relative')
                  .style('display', 'flex')
                  .style('justify-content','center')
                  .style('align-items','center')


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

    //Appending tooltip element
    if (this.options.legend) {
      var tooltip = chart
                     .append('div')
                     .attr('class','tooltip')
                     .style('position','absolute')
                     .style('display','none')
                     .style('pointer-events','none')
      tooltip.append('div')
                     .attr('class','tooltip-label')
      tooltip.append('div')
                     .attr('class','tooltip-value')
    }

    this.update = function() {
      var width = parseInt((chart.style('width')))
      var height = (width > 600) ? width / 1.5 : width
      var outerRadius = Math.min(width, height) / 2
      var innerRadius = outerRadius * this.options.innerRadiusSize

      //Updating chart elements with new width and height
      chart.style('height', height + 'px')
      svg.attr('width', width)
         .attr('height', height)
      g.attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')')

      var arc = d3.arc()
                  .innerRadius(innerRadius)
                  .outerRadius(outerRadius)

      var path = g.selectAll('path')
                  .data(pieGenerator(this.options.dataset))

      var updPath = path.enter()
                  .append('path')
                .merge(path)
                  .attr('d', arc)
                  .attr('fill', function(d, i) {
                    return color(d.data.label)
                  })

      if (this.options.legend) {
        updPath.on('mouseover', function(d) {
          tooltip.style('display','block')
          tooltip.select('.tooltip-label')
                 .text(d.data.label)
          tooltip.select('.tooltip-value')
                 .text(d.value)


        })
        updPath.on('mousemove', function(d) {
          var layerY = event.layerY
          var layerX = event.layerX
          var top = (layerY < height / 2)
                ? layerY + 20
                : layerY - parseInt(tooltip.style('height')) - parseInt(tooltip.style('padding')) - 20
          var left = (layerX < width / 2)
                ? layerX + 20
                : layerX - parseInt(tooltip.style('width')) - parseInt(tooltip.style('padding')) - 20
          tooltip
                .style('top', top + 'px')
                .style('left', left + 'px');
        })
        updPath.on('mouseout', function(d) {
          tooltip.style('display', 'none')
        })
      }
    }.bind(this) //End of update()

    this.update()
    d3.select(window).on('resize', this.update);
  } // End of SvgPie constructor
})) // End of factory
