Chart.prototype.Pie = function(ctx, dataset, scale, pct) {
    var segmentTotal = 0;
    var scaleAnimation = 1;
    var rotateAnimation = 1;
    if (dataset.animateScale) {
        scaleAnimation = pct;
    }
    if (dataset.animateRotate) {
        rotateAnimation = pct;
    }
    if (typeof dataset.percentageInnerCutout == "undefined") {
        dataset.percentageInnerCutout = 0;
    }
    var cutoutRadius = dataset.radius * (dataset.percentageInnerCutout / 100);

    for (var i = 0; i < dataset.data.length; i++) {
        segmentTotal += dataset.data[i].value;
    }

    var cumulativeAngle = -Math.PI / 2;
    for (var i = 0; i < dataset.data.length; i++) {
        var segmentAngle = rotateAnimation * ((dataset.data[i].value / segmentTotal) * (Math.PI * 2));
        ctx.beginPath();
        ctx.moveTo(dataset.xPos + Math.cos(cumulativeAngle) * scaleAnimation * cutoutRadius, dataset.yPos + Math.sin(cumulativeAngle) * scaleAnimation * cutoutRadius);
        ctx.lineTo(dataset.xPos + Math.cos(cumulativeAngle) * scaleAnimation * dataset.radius, dataset.yPos + Math.sin(cumulativeAngle) * scaleAnimation * dataset.radius);
        ctx.arc(dataset.xPos, dataset.yPos, scaleAnimation * dataset.radius, cumulativeAngle, cumulativeAngle + segmentAngle, false);
        ctx.lineTo(dataset.xPos + Math.cos(cumulativeAngle + segmentAngle) * scaleAnimation * cutoutRadius, dataset.yPos + Math.sin(cumulativeAngle + segmentAngle) * scaleAnimation * cutoutRadius);
        if (cutoutRadius > 0) ctx.arc(dataset.xPos, dataset.yPos, scaleAnimation * cutoutRadius, cumulativeAngle + segmentAngle, cumulativeAngle, true);
        ctx.closePath();
        ctx.fillStyle = dataset.data[i].color;
        ctx.fill();
        if (dataset.showValues) {
            ctx.save();
            ctx.translate(dataset.xPos, dataset.yPos);
            ctx.textAlign = 'center';
            ctx.font = dataset.fontStyle + ' ' + dataset.fontSize + 'px ' + dataset.fontFamily;
            ctx.textBaseline = 'middle';
            var a = cumulativeAngle + segmentAngle / 2,
                w = ctx.measureText(dataset.data[i].value).width,
                b = Math.PI / 2 < a && a < Math.PI * 3 / 2;
            ctx.translate(Math.cos(a) * dataset.radius, Math.sin(a) * dataset.radius);
            ctx.rotate(a - (b ? Math.PI : 0));
            ctx.fillStyle = dataset.fontColor;
            ctx.fillText(dataset.data[i].value, (b ? 1 : -1) * (w / 2 + dataset.valuePadding), 0);
            ctx.restore();
        }

        if (dataset.showStroke) {
            ctx.lineWidth = dataset.strokeWidth;
            ctx.strokeStyle = dataset.strokeColor;
            ctx.stroke();
        }
        cumulativeAngle += segmentAngle;
    }
};

Chart.prototype.Doughnut = function (ctx, dataset, scale, pct) {
    if (typeof dataset.percentageInnerCutout == "undefined") {
        dataset.percentageInnerCutout = 50;
    }
    this.Pie(ctx, dataset, scale, pct);
};

Chart.prototype.PolarArea = function (ctx, dataset, scale, pct) {
    var startAngle = -Math.PI / 2,
        angleStep = (Math.PI * 2) / data.length,
        scaleAnimation = 1,
        rotateAnimation = 1;
    if (dataset.animateScale) {
        scaleAnimation = pct;
    }
    if (dataset.animateRotate) {
        rotateAnimation = pct;
    }

    for (var i = 0; i < dataset.data.length; i++) {

        ctx.beginPath();
        ctx.arc(dataset.PosX, dataset.PosY, scale.yPos(dataset.data[i].value, scaleAnimation, dataset.yAxis), startAngle, startAngle + rotateAnimation * angleStep, false);
        ctx.lineTo(dataset.PosX, dataset.PosY);
        ctx.closePath();
        ctx.fillStyle = dataset.data[i].color;
        ctx.fill();

        if (dataset.showStroke) {
            ctx.strokeStyle = dataset.strokeColor;
            ctx.lineWidth = dataset.strokeWidth;
            ctx.stroke();
        }
        startAngle += rotateAnimation * angleStep;
    }
};
