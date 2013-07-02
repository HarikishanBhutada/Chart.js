XYChart.prototype.xAxis = function (data) {
    var stackedBarGraphs = -1;
    data.xAxis.barGraphs = 0;
    for (var i = 0; i < data.datasets.length; i++) {
        if (data.datasets[i].chartType === "Bar") {
            if (data.datasets[i].stacked) {
                if (stackedBarGraphs == -1) {
                    stackedBarGraphs = data.xAxis.barGraphs;
                    data.xAxis.barGraphs++;
                }
                data.datasets[i].barIndex = stackedBarGraphs;
            } else {
                data.datasets[i].barIndex = data.xAxis.barGraphs;
                data.xAxis.barGraphs++;
            }
        }
    }
    if (typeof data.xAxis.labels == "undefined" || data.xAxis.labels.length == 0) {
        data.xAxis.labels = [];
        data.xAxis.showLabels = false;
        var numOfLabels = 1;
        for (var i = 0; i < data.datasets.length; i++) {
            numOfLabels = Math.max(data.datasets[i].data.length, numOfLabels);
        }
        for (var l = 0; l < numOfLabels; l++) {
            data.xAxis.labels.push("");
        }
    }
};

XYChart.prototype.xAxis.defaults = {
    showTitle: false,
    showLabels: true,
    fontFamily: "'Arial'",
    fontSize: 12,
    fontStyle: "normal",
    fontColor: "#666",
    scaleXAxisPoint: 0,
    showGridLines: true,
    gridLineWidth: 0.5,
    gridLineColor: "rgba(0,0,0,.05)",
    showMiddleGridLines: true,
    gridMiddleLineWidth: 0.5,
    gridMiddleLineColor: "rgba(0,0,0,.05)",
    lineWidth: 1,
    lineColor: "rgba(0,0,0,.1)",
    valueSpacing: 5,
    barSpacing: 1
};