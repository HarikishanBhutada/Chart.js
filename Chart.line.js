XYChart.prototype.Line = function (ctx, dataset, scale, pct) {
    ctx.strokeStyle = dataset.strokeColor;
    ctx.lineWidth = dataset.strokeWidth;
    ctx.beginPath();
    var yPos = scale.yPos(dataset.data[0], pct, dataset.yAxis);
    var xPos = scale.xPos(0, dataset.yAxis, true);
    ctx.moveTo(xPos, yPos);
        
    for (var j = 1; j < dataset.data.length; j++) {
        var yPosLast = yPos;
        yPos = scale.yPos(dataset.data[j], pct, dataset.yAxis);
        var xPosMiddle = scale.xPos(j, dataset.yAxis, false);
        xPos = scale.xPos(j, dataset.yAxis, true);
        if (dataset.bezierCurve) {
            ctx.bezierCurveTo(xPosMiddle, yPosLast, xPosMiddle, yPos, xPos, yPos);
        } else {
            ctx.lineTo(xPos, yPos);
        }
    }
    ctx.stroke();

    if (dataset.fill) {
        ctx.lineTo(scale.yAxis[dataset.yAxis].PosX + (scale.xAxisHop * (dataset.data.length - 1) + (scale.xAxisHop * 0.5)), scale.xAxisPosY);
        ctx.lineTo(scale.yAxis[dataset.yAxis].PosX + (scale.xAxisHop * 0.5), scale.xAxisPosY);
        ctx.closePath();
        ctx.fillStyle = dataset.fillColor;
        ctx.fill();
    } else {
        ctx.closePath();
    }
    if (dataset.pointDot) {
        this.Scatter(ctx, dataset, scale, pct);
    }
};

XYChart.prototype.Line.defaults = {
    strokeWidth: 2,
    strokeColor: "rgba(color,1)",
    fillColor: "rgba(color,0.5)",
    pointColor: "rgba(color,1)",
    pointStrokeColor: "rgba(color,0.5)",
    yAxis: 0,
    fill: false,
    pointDot: false,
    animationEasing: "easeOutQuart"
};


XYChart.prototype.Scatter = function (ctx, dataset, scale, pct) {
    ctx.fillStyle = dataset.pointColor;
    ctx.strokeStyle = dataset.pointStrokeColor;
    ctx.lineWidth = dataset.pointDotStrokeWidth;
    for (var k = 0; k < dataset.data.length; k++) {
        ctx.beginPath();
        ctx.arc(scale.yAxis[dataset.yAxis].PosX + (scale.xAxisHop * (k + 0.5)), scale.xAxisPosY - pct * (scale.calculateOffset(dataset.data[k], dataset.yAxis)), dataset.pointDotRadius, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
};

XYChart.prototype.Scatter.defaults = {
    pointDotStrokeWidth: 2,
    pointColor: "rgba(color,1)",
    pointStrokeColor: "rgba(color,0.5)",
    yAxis: 0,
    fill: false,
    pointDot: true,
    pointDotRadius: 4,
    animationEasing: "easeOutQuart"
};