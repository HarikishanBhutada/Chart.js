window.Chart = function(context, options) {

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
            for (var i = 0; i < data.datasets.length; i++) {
                if (data.datasets[i].chartType === "Bar") {
                    data.datasets[i].barIndex = barGraphs;
                    barGraphs++;
                }
            }
            scale.barValueSpacing = 5;
            scale.barSpacing = 10;
            scale.barWidth = (scale.xAxisHop - (scale.barValueSpacing * 2) - (scale.barSpacing * (barGraphs - 1))) / barGraphs;
        }
        for (var i = 0; i < data.datasets.length; i++) {
            if (typeof chart[data.datasets[i].chartType] != 'undefined') {
                chart[data.datasets[i].chartType](context, data.datasets[i], scale, pct);
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

