Chart.prototype.Bar = function (ctx, dataset, scale, pct) {
    ctx.lineWidth = dataset.strokeWidth;
    ctx.fillStyle = dataset.fillColor;
    ctx.strokeStyle = dataset.strokeColor;
    for (var j = 0; j < dataset.data.length; j++) {
        var barOffset = scale.xPos(j, dataset.yAxis, false) + scale.barValueSpacing + scale.barWidth * dataset.barIndex + scale.barSpacing * dataset.barIndex;

        ctx.beginPath();
        ctx.moveTo(barOffset, dataset.stacked ? scale.yStackedBase(dataset.data[j], j, dataset.yAxis) : scale.xAxisPosY);
        var yPosTo = dataset.stacked ? scale.yStackedPos(dataset.data[j], pct, dataset.yAxis, j) : scale.yPos(dataset.data[j], pct, dataset.yAxis);
        ctx.lineTo(barOffset, yPosTo);
        ctx.lineTo(barOffset + scale.barWidth, yPosTo);
        ctx.lineTo(barOffset + scale.barWidth, dataset.stacked ? scale.yStackedBase(dataset.data[j], j, dataset.yAxis) : scale.xAxisPosY);
        if (dataset.stacked) {
            scale.yStackedRebase(dataset.data[j], j, dataset.yAxis, yPosTo);
        }
        if (dataset.showStroke) {
            ctx.stroke();
        }
        ctx.closePath();
        ctx.fill();
    }
};

Chart.prototype.Bar.defaults = {
    showStroke: true,
    strokeWidth: 2,
    strokeColor: "rgba(color,1)",
    fillColor: "rgba(color,0.5)",
    yAxis: 0,
    animationEasing: "easeOutQuart"
};