/**
 * UMD
 */
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
}(this, factory))

/**
 * Factory
 */
function factory (d3) {
  /**
   * Default options
   */
  var defaultOptions = {
    // The size of inner radius comparing to the outer radius
    innerRadiusSize: 0.7,

    // To show tooltips or not
    showTooltip: true,

    // To show labels or not
    showLabels: false,

    // To sort the data or not
    sort: false,

    // Color to interpolate
    colors: ['#004A7C', '#CDFC41', '#A2A2A1'],

    // Transition length
    transition: 700,

    // Initial transition
    initialTransition: false,

    // Force using percents
    percents: false,

    // To show a tooltip for the Other field on not
    showOtherTooltip: false,

    // The size of the Other segment
    otherSize: 1
  }

  /**
   * Factory returns the main constructor
   */
  return function SvgPie (selector, params) {
    // Applying constructor when called without 'new'
    if (!(this instanceof SvgPie)) return new SvgPie(selector, params)

    // Merging options
    this.options = Object.assign(defaultOptions, params.options)
    this.data = params.data
    // For deep functions
    var that = this

    // Selections
    var chart = d3.select(selector)
    var svg = chart.append('svg')
    var g = svg.append('g')

    // Initital styling
    chart
        .style('position', 'relative')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
    svg
        .style('position', 'absolute')
        .style('top', '0')
        .style('left', '0')

    // Other variables
    var path, chartLabels, color, colorCoeff
    var transitioned = false // Initital transition finished?
    var dataset // Local dataset

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

    /**
     * D3 pie generator
     * @param {Object[]} dataset - Array of objects with values and labels
     * @return {Object[]} angles - Array of objects with angles, values, and linked data object
     */
    var pieGenerator = d3.pie()
        .value(function (d) { return d.value })
        .sort(function (a, b) {
          if (typeof that.options.sort === 'boolean' && that.options.sort) {
            return (((b.value - a.value) > 0) && (b.label !== 'Other'))
          } else {
            return null
          }
        })

    /**
     * Update when data is changed
     */
    this.update = function () {
      /**
       * Saving labels
       */
      var labels
      if (typeof this.data.labels === 'string') {
        labels = [this.data.labels] // New empty array
      } else if (Array.isArray(this.data.labels)) {
        labels = this.data.labels
      }

      /**
       * Saving data to the local array dataset
       */
      dataset = []
      // Dataset
      if (Array.isArray(this.data.dataset) && typeof this.data.dataset[0] === 'object') {
        this.data.dataset.forEach(function (obj) {
          dataset.push(Object.assign({}, obj))
        })

      // Number
      } else if (typeof this.data.values === 'number') {
        dataset.push({
          value: this.data.values,
          label: (typeof labels[0] === 'string') ? labels[0] : ''
        })

      // Array
      } else if (Array.isArray(this.data.values) && (this.data.values.length > 0)) {
        this.data.values.forEach(function (value, index) {
          dataset.push({
            value: value,
            label: (typeof labels[index] === 'string') ? labels[index] : ''
          })
        })

      // No data
      } else {
        throw new Error('No data provided')
      }

      /**
       * Calculate percents. If sum < 100% add new 'Other' field.
       */
      if (typeof this.options.percents === 'boolean' && this.options.percents) {
        var sum = dataset
            .map(function (d) { return d.value })
            .reduce(function (a, val) { return a + val })
        if (sum < 100) {
          dataset.push({
            value: 100 - sum,
            label: 'Other'
          })
        }
      }

      /**
       * Selections: Update, Exit, Enter
       */
      var segments = g.selectAll('.segment').data(pieGenerator(dataset), function (d) {
        return d.data.label
      })

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
      // Update labels
      if (typeof this.options.showLabels === 'boolean' && this.options.showLabels) {
        chartLabels = allSegments.select('text')
          .text(function (d) { return d.data.label })
          .style('font-size', '.8em')
          .attr('class', 'chart-label')
      }

      /**
       * Calculate color gradient according to the dataset length
       */
      colorCoeff = (dataset.length - 1) / (this.options.colors.length - 1)
      color = d3.scaleLinear()
          .domain(this.options.colors.map(function (color, index) {
            return index * colorCoeff
          }))
          .interpolate(d3.interpolateHcl)
          .range(this.options.colors.map(function (color) {
            return d3.rgb(color)
          }))

      // Paint paths according to the new 'color' generator
      path
          .attr('fill', function (d, i) { return color(i) })

      // Render the chart
      this.render()
    }.bind(this)

    /**
     * Render updates
     * Separate function for responsive design
     */
    this.render = function () {
      var width = parseInt((chart.style('width')))
      var height = (width > 600) ? width / 1.5 : width
      var outerRadius = Math.min(width, height) / 2
      var innerRadius = outerRadius * this.options.innerRadiusSize

      // Updating chart elements with new width and height
      chart.style('height', height + 'px')
      svg.attr('width', width).attr('height', height)
      g.attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')')

      /**
       * D3 arc generator
       * @param {Object} params - Object with start/end angles and inner/outer radiuses. Params can be passed as constants with .innerRadius(0) etc
       * @return {String} arc - Returns something like that: "M0,-100A100,100,0,0,1,100,0L0,0Z"
       */
      var arc = d3.arc()
        .innerRadius(function (d, i) {
          return ((d.data.label === 'Other') && (innerRadius > 0)) ? innerRadius + (outerRadius - innerRadius) * (1 - that.options.otherSize) / 2 : innerRadius
        })
        .outerRadius(function (d, i) {
          return (d.data.label === 'Other') ? outerRadius - (outerRadius - innerRadius) * (1 - that.options.otherSize) / 2 : outerRadius
        })

      // Display labels
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

      // If a transition valuefrom user options is Boolean & 'true', not a number, use default number value
      if (typeof this.options.transition === 'boolean' && this.options.transition) {
        this.options.transition = this.defaultOptions.transition
      }

      // Transition
      if (typeof this.options.transition === 'number' && (this.options.transition > 0)) {
        console.log(dataset)
        path
          .transition()
          .duration(this.options.transition)
          .attrTween('d', function (d, i) {
            // Initital transition
            // If there was not transitions before and initialTransition is 'true' start from 0's
            if (typeof this._current === 'undefined' && typeof that.options.initialTransition === 'boolean' && that.options.initialTransition && !transitioned) {
              this._current = {
                index: i,
                startAngle: 0
              }
              this._current.endAngle = (i === dataset.length - 1) ? Math.PI * 2 : 0
            }
            if (typeof this._current === 'undefined' && transitioned) {
              this._current = Object.assign({}, d)
              this._current.endAngle = this._current.startAngle
            }
            var interpolate = d3.interpolate(this._current, d)
            this._current = interpolate(0)
            return function (t) {
              return arc(interpolate(t))
            }
          })
          .on('end', function () {
            if (!transitioned) transitioned = true
            console.log('transitioned')
          })
      } else {
        path
          .attr('d', arc)
      }

      // Show tooltips
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

        chart.node().addEventListener('mousemove', function (event) {
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
}
