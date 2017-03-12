#svg-pie
`svg-pie` is a free, open source module for creating responsive vector pie charts. Based on D3 v.4

##Installation  
From NPM :
    npm install svg-pie

Download:
* [Minified version](https://raw.githubusercontent.com/zemlyansky/svg-pie/master/svg-pie.min.js)
* [Minified version with all needed D3 modules](https://raw.githubusercontent.com/zemlyansky/svg-pie/master/svg-pie.bundle.min.js)

##Features
* tooltips
* custom color range
* color interpolation
* customizable inner radius (doughnut version)
* different input formats (number, array, array of objects)
* sorting
* responsive

##Usage

###DOM
Add `<div id="chart"></div>` where you want to place a pie chart.
Feel free to add any content between `<div>` and `</div>`. It'll be centered.

###Javascript   
The module return a constructor that accepts two parameters: `selector` and `options`

####CommonJS
```javascript
var SvgChart = require('svg-pie')
var chart = new SvgChart('#chart', options)
```
####Browser
Use `svg-pie.min.js` together with D3:
```html
<script src="https://d3js.org/d3.v4.js"></script>
<script src="svg-pie.min.js" charset="utf-8"></script>
<script type="text/javascript">
  var chart = new SvgPie('#chart', options)
</script>
```

`svg-pie.bundle.min.js` includes all needed dependencies:
```html
<script src="svg-pie.bundle.min.js" charset="utf-8"></script>
<script type="text/javascript">
  var chart = new SvgPie('#chart', options)
</script>
```

###Options
Options is basically an object you pass to constructor. Like that:
```javascript
new SvgPie('#chart', {
  dataset: [
    {label: 'Ben', value: 10},
    {label: 'Bill', value: 20},
    {label: 'Jane', value: 70},
  ],
  innerRadiusSize: .9,
  sort: true
  colors: ['#FF0000','#0055EE']
})
```

<table>
    <tr>
        <th>Parameter</th>
        <th>Default value</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><strong>dataset</strong></td>
        <td><code>undefined</code></td>
        <td>Actual data. Array of objects. Each objects should have a `value`. `label` is optional</td>
    </tr>
    <tr>
        <td><strong>values</strong></td>
        <td><code>undefined</code></td>
        <td>Array of numbers. Alternative to dataset (array of objects)</td>
    </tr>
    <tr>
        <td><strong>labels</strong></td>
        <td><code>undefined</code></td>
        <td>Array of strings. Alternative to dataset (array of objects)</td>
    </tr>
    <tr>
        <td><strong>showTooltip</strong></td>
        <td><code>true</code></td>
        <td>Boolean. To show or not the tooltip</td>
    </tr>
    <tr>
        <td><strong>sort</strong></td>
        <td><code>false</code></td>
        <td>Boolean. To sort the data or not</td>
    </tr>
    <tr>
        <td><strong>innerRadiusSize</strong></td>
        <td><code>0.7</code></td>
        <td>Float [0,1]. The size of innerRadius comparing to outerRadius</td>
    </tr>
    <tr>
        <td><strong>colors</strong></td>
        <td><code>['#004A7C','#CDFC41','#A2A2A1']</code></td>
        <td>Array of strings. List of colors to interpolate </td>
    </tr>
</table>

###Style
By default a chart, its inner content and a tooltip have no styling.
To style the tooltip use CSS and `.tooltip`, `.tooltip-label`, `.tooltip-value` selectors.
For example:
```CSS
.tooltip {
  font-size: .8em;
  background: white;
  box-shadow: 0 0 10px rgba(0,0,0,.2);
  padding: 10px;
  opacity: .8;
}
.tooltip-label {
  font-size: 1.2em;
  font-weight: bold;
}
```

To style inner content of the chart, feel free to add your own DOM elements:
```html
<div id="chart">
  <div class="your-new-element">70%</div>
</div>
```
