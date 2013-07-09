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
            minValue = Math.min(minValue, data.datasets[i].data.reduce(function(m, o) {
                return (o != null && o < m) ? o : m;
            }, Infinity));
            maxValue = Math.max(maxValue, data.datasets[i].data.reduce(function (m, o) {
                return (o != null && o > m) ? o : m;
            }, -Infinity));
        }
    }
    this.yAxis.lineDefaults.minValue = (minValue == Infinity) ? 0 : minValue;
    this.yAxis.lineDefaults.maxValue = (maxValue == -Infinity) ? 0 : maxValue;
  
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
    showLine: true,
    lineWidth: 1,
    lineColor: "rgba(0,0,0,.1)"
};

XYChart.prototype.yAxis.gridDefaults = {
    minSteps: 2,
    showGridLines: true,
    gridLineWidth: 0.5,
    gridLineColor: "rgba(0,0,0,.05)"
};