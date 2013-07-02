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

window.XYChart = function (context, options) {

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
    var position = getPosition(context.canvas);

    if (window.Touch) {
        context.canvas.ontouchstart = function (e) {
            e.offsetX = e.targetTouches[0].clientX - position.x;
            e.offsetY = e.targetTouches[0].clientY - position.y;
            activeDataPointHandler(e);
        };
        context.canvas.ontouchmove = function (e) {
            e.offsetX = e.targetTouches[0].clientX - position.x;
            e.offsetY = e.targetTouches[0].clientY - position.y;
            activeDataPointHandler(e);
        };
    } else {
        context.canvas.onmousemove = function (e) {
            activeDataPointHandler(e);
        };
    }

    function activeDataPointHandler(event) {
        if (typeof event != "undefined" && event != null && typeof chart.scaleData.xVal != "undefined") {
            var point = { xAxis: -1, yAxis: [] };
            point.xAxis = chart.scaleData.xVal(event.offsetX);
            point.bar = chart.scaleData.bar(event.offsetX);
            point.yAxis[0] = chart.scaleData.yVal(event.offsetY, 0);
            point.yAxis[1] = chart.scaleData.yVal(event.offsetY, 1);
            chart.mouseover({ event: event, point: point });
        }
    }

    this.data = {};
    this.scaleData = {};
    this.mouseover = function (e) {
    };

    this.draw = function (steps) {
        chart.scaleData = setScale(chart.data);
        animationLoop(animateFrame, steps);
        if (typeof options != "undefined") {
            if (typeof options.onAnimationComplete == "function") {
                options.onAnimationComplete();
            }
        }
    };
    this.clear = function () {
        context.clearRect(0, 0, width, height);
    };
    var animateFrame = function (pct) {
        chart.clear();
        drawData(chart.data, chart.scaleData, pct);
    };

    var setScale = function (data) {
        var dHeight = height;
        var dWidth = width;
        var rotated = false;
        if (typeof options != "undefined" && options.rotate) {
            context.save();
            context.translate(width, 0);
            context.rotate(Math.PI * 1 / 2);
            dHeight = width;
            dWidth = height;
            rotated = true;
        }

        data.xAxis = mergeChartConfig(chart.xAxis.defaults, data.xAxis, -1);
        chart.xAxis(data);
        data.yAxis = mergeChartConfig(chart.yAxis.gridDefaults, data.yAxis, -1);
        if (typeof data.yAxis.lines == "undefined") data.yAxis.lines = [];
        chart.yAxis(data, 0);
        data.yAxis.lines[0] = mergeChartConfig(chart.yAxis.lineDefaults, data.yAxis.lines[0], -1);
        chart.yAxis(data, 1);
        data.yAxis.lines[1] = mergeChartConfig(chart.yAxis.lineDefaults, data.yAxis.lines[1], -1);
        data.yAxis = mergeChartConfig(chart.yAxis.gridDefaults, data.yAxis, -1);
        if (!data.yAxis.lines[1].show) data.yAxis.lines.pop();
        var scale = chart.Scale(context, data.yAxis, data.xAxis, dHeight, dWidth, rotated);
        scale.barValueSpacing = data.xAxis.valueSpacing;
        scale.barSpacing = data.xAxis.barSpacing;
        scale.barWidth = (scale.xAxisHop - (scale.barValueSpacing * 2) - (scale.barSpacing * (data.xAxis.barGraphs - 1))) / data.xAxis.barGraphs;
        return scale;
    };

    var drawData = function (data, scale, pct) {
        var dHeight = height;
        var dWidth = width;
        var rotated = false;
        if (typeof options != "undefined" && options.rotate) {
            context.save();
            context.translate(width, 0);
            context.rotate(Math.PI * 1 / 2);
            dHeight = width;
            dWidth = height;
            rotated = true;
        }
        chart.DrawScale(context, data.yAxis, data.xAxis, dHeight, dWidth, scale);
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
        if (rotated) {
            context.restore();
        }
        return scale;
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
        if (attrname.indexOf("Color") > -1) {
            returnObj[attrname] = defaults[attrname].replace("color", getColor(i));
        } else {
            returnObj[attrname] = defaults[attrname];
        }
    }
    for (attrname in userDefined) { returnObj[attrname] = userDefined[attrname]; }
    return returnObj;
}

function getColor(i) {
    return (Charts.colors.length > i && i < 0) ? "0,0,0" : Charts.colors[i];
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

function getPosition(e) {
    var xPosition = 0;
    var yPosition = 0;

    while (e) {
        xPosition += (e.offsetLeft + e.clientLeft);
        yPosition += (e.offsetTop + e.clientTop);
        e = e.offsetParent;
    }
    if (window.pageXOffset > 0 || window.pageYOffset > 0) {
        xPosition -= window.pageXOffset;
        yPosition -= window.pageYOffset;
    } else if (document.body.scrollLeft > 0 || document.body.scrollTop > 0) {
        xPosition -= document.body.scrollLeft;
        yPosition -= document.body.scrollTop;
    }
    return { x: xPosition, y: yPosition };
}
