svg-pie
=======
`svg-pie` is a free, open source module for creating responsive vector pie charts. Based on D3 v.4

Installation  
------------
From NPM :
* `npm install svg-pie`

Download:
* [Minified version](https://raw.githubusercontent.com/zemlyansky/svg-pie/master/svg-pie.min.js) (~5K)
* [Minified version with all needed D3 modules](https://raw.githubusercontent.com/zemlyansky/svg-pie/master/svg-pie.bundle.min.js) (~100K)

Examples:
* [zemlyansky.github.io/svg-pie/](http://zemlyansky.github.io/svg-pie/)

Features
--------
* tooltips
* custom color range
* color interpolation
* customizable inner radius (doughnut version)
* different input formats (number, array, array of objects)
* sorting
* responsive
* animation

Usage
-----

### DOM
Add `<div id="chart"></div>` where you want to place a pie chart.
Feel free to add any content between `<div>` and `</div>`. It'll be centered.

### Javascript   
The module return a constructor that accepts two parameters: `selector` and `options`

#### CommonJS
```javascript
var SvgChart = require('svg-pie')
var chart = new SvgChart('#chart', options)
```
#### Browser
Use `svg-pie.min.js` together with D3:
```html
<script src="https://d3js.org/d3.v4.js"></script>
<script src="svg-pie.min.js" charset="utf-8"></script>
<script type="text/javascript">
  var chart = new SvgPie('#chart', {data: {...}, options: {...}})
</script>
```

`svg-pie.bundle.min.js` includes all needed dependencies:
```html
<script src="svg-pie.bundle.min.js" charset="utf-8"></script>
<script type="text/javascript">
  var chart = new SvgPie('#chart', {data: {...}, options: {...}})
</script>
```

### Data & Options
Data and Options are objects you pass to constructor. Like that:
```javascript
new SvgPie('#chart1', {
    data: {
        dataset: [
            {label: 'Label 1', value: 65},
            {label: 'Label 2', value: 35},
        ]
    },
    options: {
        innerRadiusSize: .7,
        transition: 2000,
        initialTransition: true,
        sort: true,
        colors: ['#44DDDD','#EEEEEE']
    }
})
```
### Data
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
        <td>Array of numbers. Alternative to <code>dataset</code></td>
    </tr>
    <tr>
        <td><strong>labels</strong></td>
        <td><code>undefined</code></td>
        <td>Array of strings. Alternative to <code>dataset</code></td>
    </tr>
    <tr>
</table>

### Options
<table>
    <tr>
        <th>Parameter</th>
        <th>Default value</th>
        <th>Description</th>
    </tr>
        <td><strong>showTooltip</strong></td>
        <td><code>true</code></td>
        <td>Boolean. To show or not a tooltip</td>
    </tr>
    <tr>
        <td><strong>showLabels</strong></td>
        <td><code>false</code></td>
        <td>Boolean. To show or not labels on a chart</td>
    </tr>
    <tr>
        <td><strong>sort</strong></td>
        <td><code>false</code></td>
        <td>Boolean. To sort data or not</td>
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
    <tr>
        <td><strong>transition</strong></td>
        <td><code>700</code></td>
        <td>Number or Boolean. Transition duration. Accepts boolean <code>true</code> ~ default <code>700</code></td>
    </tr>
    <tr>
        <td><strong>initialTransition</strong></td>
        <td><code>false</code></td>
        <td>Boolean. To show or not initial animation</td>
    </tr>
    <tr>
        <td><strong>percents</strong></td>
        <td><code>false</code></td>
        <td>Boolean. Pass values as percents. Calculates the <code>Other</code> field if sum < 100%</td>
    </tr>
    <tr>
        <td><strong>group</strong></td>
        <td><code>false</code></td>
        <td>Boolean. Group small values into the <code>Other</code></td>
    </tr>    
    <tr>
        <td><strong>showOtherTooltip</strong></td>
        <td><code>false</code></td>
        <td>Boolean. To show or not a tooltip for the <code>Other</code> field</td>
    </tr>
    <tr>
        <td><strong>otherSize</strong></td>
        <td><code>1</code></td>
        <td>Float [0,1]. Relative size of the <code>Other</code> segment. <code>1</code> - same size as other segments. <code>0</code> - hidden</td>
    </tr>
</table>

### Style
By default a chart, its inner content and a tooltip have no styling.
To style the tooltip use CSS and `.csv-tooltip`, `.csv-tooltip-label`, `.csv-tooltip-value` selectors.
For example:
```CSS
.csv-tooltip {
  font-size: .8em;
  background: white;
  box-shadow: 0 0 10px rgba(0,0,0,.2);
  padding: 10px;
  opacity: .8;
}
.csv-tooltip-label {
  font-size: 1.2em;
  font-weight: bold;
}
```

To style inner content of the chart add your own DOM elements:
```html
<div id="chart">
  <div class="your-new-element">70%</div>
</div>
```
