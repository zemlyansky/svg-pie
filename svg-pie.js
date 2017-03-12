(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['d3'], factory)
    } else if (typeof module === 'object' && module.exports) {
        var d3 = Object.assign({},
          require('d3-scale'),
          require('d3-selection'),
          require('d3-shape'),
          require('d3-color'),
          require('d3-interpolate')
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
      legend: true,
      showTooltip: true,
      sort: false,
      colors: ['#004A7C','#CDFC41','#A2A2A1']
    }
    this.options = Object.assign(defaultOptions, userOptions)

    var that = this

    // Select chart element
    var chartElement = document.querySelector(selector)
    var chart = d3.select(selector)
                  .style('position', 'relative')
                  .style('display', 'flex')
                  .style('justify-content','center')
                  .style('align-items','center')

    var svg = d3.select(selector)
                .append('svg')
                .style('position','absolute')
                .style('top','0')
                .style('left','0')
    var g = svg.append('g')

    var pieGenerator = d3.pie()
                         .value(function(d) {return d.value})
                         .sort(null)

    var path, updPath, color, colorCoeff

    //Appending tooltip element
    if (this.options.showTooltip) {
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
      if (typeof(this.options.values) === 'number') {
        this.options.values = [this.options.values]
      }
      if (typeof(this.options.dataset) === 'undefined' && typeof(this.options.values) !== 'undefined') {
        this.options.dataset = []
        this.options.values.forEach(function (value, index) {
          that.options.dataset.push({
            value: value,
            label: (typeof(that.options.labels) !== 'undefined') ? that.options.labels[index] : ''
          })
        })
      }
      if (this.options.dataset.length === 1) {
        this.options.dataset.push({
          value: 100 - this.options.dataset[0].value,
          label: ''
        })
      }
      if (typeof(this.options.sort) === 'boolean' && this.options.sort && this.options.dataset.length > 1) {
        this.options.dataset.sort(function (a, b) {
          return b.value - a.value
        })
      }

      path = g.selectAll('path')
                  .data(pieGenerator(this.options.dataset))

      updPath = path.enter()
                        .append('path')
                        .merge(path)

      colorCoeff = (this.options.dataset.length - 1) / (this.options.colors.length - 1)
      color = d3//.scaleOrdinal()
                    // .range(this.options.colors)
                    .scaleLinear()
                    .domain(this.options.colors.map(function(color, index){
                      return index * colorCoeff
                    }))
                    .interpolate(d3.interpolateHcl)
                    .range(this.options.colors.map(function(color){
                        return d3.rgb(color)
                    }))
      this.render()
    }.bind(this)

    this.render = function() {
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

      updPath     .attr('d', arc)
                  .attr('fill', function(d, i) {
                    return color(i)
                  })

      if (this.options.showTooltip) {
        updPath.on('mouseover', function(d) {
          tooltip.style('display','block')
          tooltip.select('.tooltip-label')
                 .text(d.data.label)
          tooltip.select('.tooltip-value')
                 .text(d.value)
        })

        chartElement.addEventListener('mousemove', function(event) {
          var lY = event.layerY
          var lX = event.layerX

          var top = (lY < height / 2)
                  ? lY + 20
                  : lY - parseInt(tooltip.style('height')) - parseInt(tooltip.style('padding-top')) - parseInt(tooltip.style('padding-bottom')) - 20

          var left = (lX < width / 2)
                   ? lX + 20
                   : lX - parseInt(tooltip.style('width')) - parseInt(tooltip.style('padding-left')) - parseInt(tooltip.style('padding-right')) - 20

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

    d3.select(window).on('resize', this.render);
  } // End of SvgPie constructor
})) // End of factory
