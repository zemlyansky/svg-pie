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
    root.SvgPie = factory(root.d3)
  }
}(this, function (d3) {
  return function SvgPie (selector, userOptions) {
    // Forcing 'new'
    if (!(this instanceof SvgPie)) return new SvgPie(selector, userOptions)
    // Default options
    // Merged later with user options
    var defaultOptions = {
      innerRadiusSize: 0.7,
      legend: true,
      showTooltip: true,
      showLabels: false,
      sort: false,
      colors: ['#004A7C', '#CDFC41', '#A2A2A1'],
      transition: 700,
      initialTransition: false,
      percents: false,
      showOtherTooltip: false,
      otherSize: 1
    }
    // Merging
    this.options = Object.assign(defaultOptions, userOptions)

    var that = this

    // Selecting elements
    var chartElement = document.querySelector(selector)
    var chart = d3.select(selector)
        .style('position', 'relative')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')

    var svg = d3.select(selector)
        .append('svg')
        .style('position', 'absolute')
        .style('top', '0')
        .style('left', '0')

    var g = svg.append('g')

    var pieGenerator = d3.pie()
        .value(function (d) { return d.value })
        .sort(null)

    var path, chartLabels, color, colorCoeff

    // Is initial transition finished:
    var transitioned = false

    // Appending tooltip element
    if (this.options.showTooltip) {
      var tooltip = chart.append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('display', 'none')
          .style('pointer-events', 'none')
      tooltip.append('div')
          .attr('class', 'tooltip-label')
      tooltip.append('div')
          .attr('class', 'tooltip-value')
    }

    // UPDATE DATA AND CALL RENDER FUNCTION
    this.update = function () {
      // Check if there's a number instead of array
      if (typeof this.options.values === 'number') {
        this.options.values = [this.options.values]
      }
      // Convert labels and values arrays to the main array of objects
      if (typeof this.options.values !== 'undefined') {
        this.options.dataset = []
        this.options.values.forEach(function (value, index) {
          that.options.dataset.push({
            value: value,
            label: (typeof (that.options.labels) !== 'undefined') ? that.options.labels[index] : ''
          })
        })
        delete this.options.values
        delete this.options.labels
      }
      // Calculate percents
      if (typeof this.options.percents === 'boolean' && this.options.percents) {
        var sum = this.options.dataset
            .map(function (d) { return d.value })
            .reduce(function (a, val) { return a + val })
        if (sum < 100) {
          this.options.dataset.push({
            value: 100 - sum,
            label: 'Other'
          })
        }
      }

      // Sort
      if (typeof this.options.sort === 'boolean' && this.options.sort && this.options.dataset.length > 1) {
        this.options.dataset.sort(function (a, b) {
          return b.value - a.value
        })
      }

      // Initial transition
      if (this.options.initialTransition && !transitioned) {
        // Save current state
        var _options = JSON.stringify(this.options)
        // Disable sorting and labeling
        this.options.sort = false
        this.options.showLabels = false
        // Make the last value 100%
        this.options.dataset.forEach(function (d, i) {
          d.value = (i === (that.options.dataset.length - 1)) ? 100 : 0
        })
        // This tick: skip setTimeout, render 'fake' dataset
        // Next tick: restore correct data, render with transition
        setTimeout(function () {
          transitioned = true
          that.options = JSON.parse(_options)
          that.update()
        }, 0)
      }

      // Update
      var segments = g.selectAll('.segment')
        .data(pieGenerator(this.options.dataset))

      // Exit
      segments.exit()
        .remove()

      // Enter
      var enterSegments = segments.enter()
        .append('g')
        .attr('class', 'segment')
      enterSegments.append('path')
      enterSegments.append('text')

      // Update and Enter
      var allSegments = enterSegments.merge(segments)
      path = allSegments.select('path')
      if (typeof this.options.showLabels === 'boolean' && this.options.showLabels) {
        chartLabels = allSegments.select('text')
          .text(function (d) { return d.data.label })
          .style('font-size', '.8em')
          .attr('class', 'chart-label')
      }

      // Calculate color gradient according to the data length
      colorCoeff = (this.options.dataset.length - 1) / (this.options.colors.length - 1)
      color = d3.scaleLinear()
        .domain(this.options.colors.map(function (color, index) {
          return index * colorCoeff
        }))
        .interpolate(d3.interpolateHcl)
        .range(this.options.colors.map(function (color) {
          return d3.rgb(color)
        }))
      path
        .attr('fill', function (d, i) { return color(i) })

      // Render the chart
      this.render()
    }.bind(this)

    this.render = function () {
      var width = parseInt((chart.style('width')))
      var height = (width > 600) ? width / 1.5 : width
      var outerRadius = Math.min(width, height) / 2
      var innerRadius = outerRadius * this.options.innerRadiusSize

      // Updating chart elements with new width and height
      chart.style('height', height + 'px')
      svg.attr('width', width).attr('height', height)
      g.attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')')

      var arc = d3.arc()
        .innerRadius(function (d, i) {
          return ((d.data.label === 'Other') && (innerRadius > 0)) ? innerRadius + (outerRadius - innerRadius) * (1 - that.options.otherSize) / 2 : innerRadius
        })
        .outerRadius(function (d, i) {
          return (d.data.label === 'Other') ? outerRadius - (outerRadius - innerRadius) * (1 - that.options.otherSize) / 2 : outerRadius
        })

      if (typeof this.options.showLabels === 'boolean' && this.options.showLabels) {
        var r = outerRadius - 25
        var labelArc = d3.arc()
          .innerRadius(r)
          .outerRadius(r)
        chartLabels
          .attr('transform', function (d) { return 'translate(' + labelArc.centroid(d) + ')' })
          .attr('dy', '0.35em')
          .attr('dx', function (d) {
            // Shifting labels on the right side to left
            var centroid = labelArc.centroid(d)
            if (centroid[0] > 0) {
              return (-(d.data.label.length * 10) * labelArc.centroid(d)[0] / outerRadius).toFixed(0) + 'px'
            } else {
              return '0px'
            }
          })
      }

      // If transition is 'true', use default values
      if (typeof this.options.transition === 'boolean' && this.options.transition) {
        this.options.transition = this.defaultOptions.transition
      }

      // Transition
      if (typeof this.options.transition === 'number' && this.options.transition) {
        path
          .transition()
          .duration(this.options.transition)
          .attrTween('d', function (d) {
            var interpolate = d3.interpolate(this._current, d)
            this._current = interpolate(0)
            return function (t) {
              return arc(interpolate(t))
            }
          })
      } else {
        path
          .attr('d', arc)
      }

      if (typeof this.options.showTooltip === 'boolean' && this.options.showTooltip) {
        path.on('mouseover', function (d) {
          if (d.data.label !== 'Other') {
            tooltip.style('display', 'block')
            tooltip.select('.tooltip-label')
                   .text(d.data.label)
            tooltip.select('.tooltip-value')
                   .text((that.options.percents) ? d.data.value + '%' : d.data.value)
          }
        })

        chartElement.addEventListener('mousemove', function (event) {
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
              .style('left', left + 'px')
        })

        path.on('mouseout', function (d) {
          tooltip.style('display', 'none')
        })
      }
    }.bind(this) // End of update()

    this.update()

    d3.select(window).on('resize.' + selector.replace(/[^a-z0-9_-]/gi, ''), this.render)
  } // End of SvgPie constructor
})) // End of factory
