Chart.prototype.yAxis = function (data, index) {
    var minValue = 0;
    var maxValue = 0;
    if (typeof data.datasets.yAxis == "undefined") {
        data.datasets.yAxis = 0;
    }
    this.yAxis.lineDefaults.show = false;
    for (var i = 0; i < data.datasets.length; i++) {
        if (data.datasets.yAxis == index) {
            this.yAxis.lineDefaults.show = true;
            minValue = minOfArray(data.datasets[i].data);
            maxValue = maxOfArray(data.datasets[i].data);
        }
    }
    this.yAxis.lineDefaults.minValue = minValue;
    this.yAxis.lineDefaults.maxValue = maxValue;
    
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

Chart.prototype.yAxis.lineDefaults = {
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

Chart.prototype.yAxis.gridDefaults = {
    minSteps: 2,
    showGridLines: true,
    gridLineWidth: 0.5,
    gridLineColor: "rgba(0,0,0,.05)",
    lines: []
};