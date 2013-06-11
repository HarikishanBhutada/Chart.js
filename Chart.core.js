/*!
 * repository https://github.com/WimAtIHomer/Chart.js
 * This is Wim Pool's Fork of: 
 *
 * Chart.js
 * http://chartjs.org/
 *
 * Copyright 2013 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */

window.Charts = {
    animationOptions: {},
    colors: [],
    cache: {},
    template: function (str, data) { return data; }
};

window.Chart = function (context, options) {

    var chart = this;

    //Variables global to the chart
    var width = context.canvas.width;
    var height = context.canvas.height;

    //High pixel density displays - multiply the size of the canvas height/width by the device pixel ratio, then scale.
    if (window.devicePixelRatio) {
        context.canvas.style.width = width + "px";
        context.canvas.style.height = height + "px";
        context.canvas.height = height * window.devicePixelRatio;
        context.canvas.width = width * window.devicePixelRatio;
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    this.data = {};

    this.draw = function(steps) {
        animationLoop(animateFrame, steps);
        if (typeof options.onAnimationComplete == "function") options.onAnimationComplete();
    };
    this.clear = function() {
        context.clearRect(0, 0, width, height);
    };
    var animateFrame = function(pct) {
        chart.clear();
        drawData(chart.data, pct);
    };

    var drawData = function (data, pct) {
        var scale = {};
        if (typeof data.yAxis != 'undefined' && typeof data.xAxis != 'undefined') {
            scale = chart.Scale(context, data.yAxis, data.xAxis, height, width);
            var barGraphs = 0;
            var stackedBarGraphs = -1;
            for (var i = 0; i < data.datasets.length; i++) {
                if (data.datasets[i].chartType === "Bar") {
                    if (data.datasets[i].stacked) {
                        if (stackedBarGraphs == -1) {
                            stackedBarGraphs = barGraphs;
                            barGraphs++;
                        }
                        data.datasets[i].barIndex = stackedBarGraphs;
                    } else {
                        data.datasets[i].barIndex = barGraphs;
                        barGraphs++;
                    }
                }
            }
            scale.barValueSpacing = 5;
            scale.barSpacing = 10;
            scale.barWidth = (scale.xAxisHop - (scale.barValueSpacing * 2) - (scale.barSpacing * (barGraphs - 1))) / barGraphs;
        }
        for (var i = 0; i < data.datasets.length; i++) {
            if (typeof chart[data.datasets[i].chartType] != "undefined") {
                data.datasets[i] = mergeChartConfig(chart[data.datasets[i].chartType].defaults, data.datasets[i], i);
                var animationPct = pct;
                if (typeof Charts.animationOptions[data.datasets[i].animationEasing] != "undefined") {
                    animationPct = Charts.animationOptions[data.datasets[i].animationEasing](pct);
                }
                chart[data.datasets[i].chartType](context, data.datasets[i], scale, animationPct);
            }
        }
    };
};

function animationLoop(animateFrame, steps) {
    // shim layer with setTimeout fallback
    var requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    function animLoop() {
        currentstep += 1;
        animateFrame(currentstep / steps);
        //Stop the loop continuing forever
        if (currentstep < steps) {
            requestAnimFrame(animLoop);
        }
    }

    var currentstep = 0;
    requestAnimFrame(animLoop);
};

function mergeChartConfig(defaults, userDefined, i) {
    var returnObj = {};
    var attrname;
    for (attrname in defaults) {
        if (attrname.indexOf("Color") > -1 && Charts.colors.length > i) {
            returnObj[attrname] = defaults[attrname].replace("color", Charts.colors[i]);
        } else {
            returnObj[attrname] = defaults[attrname];
        }
    }
    for (attrname in userDefined) { returnObj[attrname] = userDefined[attrname]; }
    return returnObj;
}

//Is a number function
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
//Apply cap a value at a high or low number
function capValue(valueToCap, maxValue, minValue) {
    if (isNumber(maxValue)) {
        if (valueToCap > maxValue) {
            return maxValue;
        }
    }
    if (isNumber(minValue)) {
        if (valueToCap < minValue) {
            return minValue;
        }
    }
    return valueToCap;
}