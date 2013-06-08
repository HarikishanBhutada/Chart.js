Chart.prototype.Bar = function (ctx, dataset, scale, pct) {
    ctx.lineWidth = dataset.strokeWidth;
    ctx.fillStyle = dataset.fillColor;
    ctx.strokeStyle = dataset.strokeColor;
    for (var j = 0; j < dataset.data.length; j++) {
        var barOffset = scale.xPos(j, dataset.yAxis, false) + scale.barValueSpacing + scale.barWidth * dataset.barIndex + scale.barSpacing * dataset.barIndex;

        ctx.beginPath();
        ctx.moveTo(barOffset, scale.xAxisPosY);
        ctx.lineTo(barOffset, scale.yPos(dataset.data[j], pct, dataset.yAxis));
        ctx.lineTo(barOffset + scale.barWidth, scale.yPos(dataset.data[j], pct, dataset.yAxis));
        ctx.lineTo(barOffset + scale.barWidth, scale.xAxisPosY);
        if (dataset.showStroke) {
            ctx.stroke();
        }
        ctx.closePath();
        ctx.fill();
    }
}
