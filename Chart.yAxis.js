XYChart.prototype.yAxis = function (data, index) {
    var minValue = Infinity;
    var maxValue = -Infinity;

    this.yAxis.lineDefaults.show = false;
    for (var i = 0; i < data.datasets.length; i++) {
        if (typeof data.datasets[i].yAxis == "undefined") {
            data.datasets[i].yAxis = 0;
        }
        if (data.datasets[i].yAxis == index) {
            this.yAxis.lineDefaults.show = true;
            minValue = Math.min(minValue, minOfArray(data.datasets[i].data));
            maxValue = Math.max(maxValue, maxOfArray(data.datasets[i].data));
        }
    }
    this.yAxis.lineDefaults.minValue = (minValue == Infinity) ? 0 : minValue;
    this.yAxis.lineDefaults.maxValue = (maxValue == -Infinity) ? 0 : maxValue;
    
    function minOfArray(arr) {
        var min = Infinity;
        var QUANTUM = 32768;

        for (var i = 0, len = arr.length; i < len; i += QUANTUM) {
            var submin = Math.min.apply(null, arr.slice(i, Math.min(i + QUANTUM, len)));
            min = Math.min(submin, min);
        }

        return min;
    }

    function maxOfArray(arr) {
        var max = -Infinity;
        var QUANTUM = 32768;

        for (var i = 0, len = arr.length; i < len; i += QUANTUM) {
            var submax = Math.max.apply(null, arr.slice(i, Math.max(i + QUANTUM, len)));
            max = Math.max(submax, max);
        }

        return max;
    }

};

XYChart.prototype.yAxis.lineDefaults = {
    showTitle: false,
    fontFamily: "'Arial'",
    fontSize: 12,
    fontStyle: "normal",
    fontColor: "rgba(0,0,0,1)",
    labelTemplate: "<%=value%>",
    baseValue: 0,
    showLabels: true,
    lineWidth: 1,
    lineColor: "rgba(0,0,0,.1)"
};

XYChart.prototype.yAxis.gridDefaults = {
    minSteps: 2,
    showGridLines: true,
    gridLineWidth: 0.5,
    gridLineColor: "rgba(0,0,0,.05)"
};