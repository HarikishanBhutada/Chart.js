Chart.prototype.Scale = function (ctx, yAxis, xAxis, height, width, rotated) {

    var graphMargin = 5;
    var labelMargin = 5;

    var scale = { yAxis : [{
        // yAxis top left position
        PosX: 0,
        PosY: 0,
        // yAxis bottom position
        PosMin: 0,
        // yAxis length
        Length: 0,
        // yAxis space between 2 labels
        Hop: 0,
        // yAxis minimum value, copied from yAxis
        Min: 0,
        // yAxis minimum value, copied from yAxis
        Max: 0,
        // yAxis base value, default 0, copied from yAxis
        Base: 0,
        // Value between 2 labels on yAxis
        StepValue: 0,
        // Number of steps on yAxis
        NumberOfSteps: 0,
        // Labels used on yAxis
        Labels: []}],

        // xAxis position on yAxis
        xAxisPosY: 0,
        // xAxis length
        xAxisLength: 0,
        // yAxis space of one label
        xAxisHop: 0,
        // Label height of xAxis labels, dependend on xAxisxAxisRotateLabels
        xAxisLabelHeight: 0,
        // degrees the xAxis labels are rotated
        xAxisRotateLabels: 0,
        
        stackedBarPositive: [],
        stackedBarNegative: [],

        calculateOffset: function(val, yAxisIndex) {
            var outerValue = scale.yAxis[yAxisIndex].NumberOfSteps * scale.yAxis[yAxisIndex].StepValue;
            var adjustedValue = val - scale.yAxis[yAxisIndex].Base;
            var scalingFactor = capValue(adjustedValue / outerValue, 1, -1);
            return (scale.yAxis[yAxisIndex].Hop * scale.yAxis[yAxisIndex].NumberOfSteps) * scalingFactor;
        },
        yStackedBase: function (val, xAxisLabelIndex, yAxisIndex) {
            return (val >= scale.yAxis[yAxisIndex].Base) ? scale.stackedBarPositive[xAxisLabelIndex] : scale.stackedBarNegative[xAxisLabelIndex];
        },
        yStackedRebase: function (val, xAxisLabelIndex, yAxisIndex, newBase) {
            if (val >= scale.yAxis[yAxisIndex].Base) {
                scale.stackedBarPositive[xAxisLabelIndex] = newBase;
            } else {
                scale.stackedBarNegative[xAxisLabelIndex] = newBase;
            }
        },
        yStackedPos: function(val, pct, yAxisIndex, xAxisLabelIndex) {
            return scale.yStackedBase(val, xAxisLabelIndex, yAxisIndex) - pct * (scale.calculateOffset(val, yAxisIndex));
        },
        yPos: function (val, pct, yAxisIndex) {
            return scale.xAxisPosY - pct * (scale.calculateOffset(val, yAxisIndex));
        },
        xPos: function (xAxisLabelIndex, yAxisIndex, middle) {
            return scale.yAxis[yAxisIndex].PosX + (scale.xAxisHop * xAxisLabelIndex) + (middle ? (scale.xAxisHop * 0.5) : 0);
        }
    };

    scale.barSpacing = xAxis.barSpacing;
    scale.valueSpacing = xAxis.valueSpacing;
    scale.yAxis[0].Base = yAxis[0].baseValue;
        
    var rangeOrderOfMagnitude = Math.floor(Math.log(Math.max(yAxis[0].maxValue - scale.yAxis[0].Base, scale.yAxis[0].Base - yAxis[0].minValue)) / Math.LN10);

    scale.yAxis[0].Min = Math.floor(10*yAxis[0].minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude) / 10;
    scale.yAxis[0].Max = Math.ceil(10*yAxis[0].maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude) / 10 ;
    scale.yAxis[0].StepValue = Math.pow(10, rangeOrderOfMagnitude);
    scale.yAxis[0].NumberOfSteps = Math.round((scale.yAxis[0].Max - scale.yAxis[0].Min) / scale.yAxis[0].StepValue);

    //Compare number of steps to the max and min for that size yAxis, and add in half steps if need be.	        
    while (scale.yAxis[0].NumberOfSteps < yAxis[0].minSteps) {
        scale.yAxis[0].StepValue /= 2;
        scale.yAxis[0].NumberOfSteps = Math.round((scale.yAxis[0].Max - scale.yAxis[0].Min) / scale.yAxis[0].StepValue);
    }
    populateLabels();
    calculateDrawingSizes();
    drawScale();

    function calculateDrawingSizes() {
        var widestXLabel;

        //Need to check the X axis first - measure the length of each text metric, and figure out if we need to rotate by 45 degrees.
        ctx.font = xAxis.fontStyle + " " + xAxis.fontSize + "px " + xAxis.fontFamily;
        widestXLabel = 1;
        if (xAxis.showLabels) {
            for (var i = 0; i < xAxis.labels.length; i++) {
                var textLength = ctx.measureText(xAxis.labels[i]).width;
                //If the text length is longer - make that equal to longest text!
                widestXLabel = (textLength > widestXLabel) ? textLength : widestXLabel;
            }
            if (rotated) {
                scale.xAxisRotateLabels = 90;
            } else {
                if (width / xAxis.labels.length < widestXLabel) {
                    scale.xAxisRotateLabels = 45;
                    if (width / (xAxis.labels.length * 1.25) < Math.cos(scale.xAxisRotateLabels) * widestXLabel) {
                        scale.xAxisRotateLabels = 90;
                    } else {
                        widestXLabel = Math.sin(scale.xAxisRotateLabels) * widestXLabel;
                    }
                } else {
                    widestXLabel = xAxis.fontSize;
                }
            }
        }
        var longestText = 1;
        //if we are showing the labels
        if (yAxis[0].showLabels) {
            ctx.font = yAxis[0].fontStyle + " " + yAxis[0].fontSize + "px " + yAxis[0].fontFamily;
            for (var i = 0; i < scale.yAxis[0].Labels.length; i++) {
                var measuredText = ctx.measureText(scale.yAxis[0].Labels[i]).width;
                longestText = (measuredText > longestText) ? measuredText : longestText;
            }
            //Add a little extra padding from the y axis
            longestText += labelMargin;
        }

        if (rotated) {
            scale.yAxis[0].PosY = graphMargin + longestText / 2;
            scale.yAxis[0].PosX = graphMargin + yAxis[0].fontSize;
        } else {
            scale.yAxis[0].PosX = graphMargin + longestText;
            scale.yAxis[0].PosY = graphMargin + yAxis[0].fontSize / 2;
        }
        var maxSize;
        scale.xAxisLabelHeight = widestXLabel + labelMargin;
        maxSize = height - 2 * graphMargin - scale.xAxisLabelHeight - longestText / 2;
        if (xAxis.showTitle) {
            maxSize = maxSize - xAxis.fontSize - labelMargin;
        }
        scale.yAxis[0].Length = maxSize;
        scale.xAxisPosY = scale.yAxis[0].PosMin = scale.yAxis[0].Length + scale.yAxis[0].PosY;
        scale.yAxis[0].Hop = scale.yAxis[0].Length / scale.yAxis[0].NumberOfSteps;

        if (yAxis[0].showTitle) {
            scale.yAxis[0].PosX = scale.yAxis[0].PosX + yAxis[0].fontSize + labelMargin;
        }
        scale.xAxisLength = width - graphMargin - scale.yAxis[0].PosX;
        scale.xAxisHop = scale.xAxisLength / (xAxis.labels.length);
        if (scale.yAxis[0].Min < scale.yAxis[0].Base && scale.yAxis[0].Max > scale.yAxis[0].Base) {
            scale.xAxisPosY = scale.xAxisPosY - scale.yAxis[0].Length * (((scale.yAxis[0].Min - scale.yAxis[0].Base) * -1) / (scale.yAxis[0].NumberOfSteps * scale.yAxis[0].StepValue));
        }

        for (var i = 0; i < xAxis.labels.length; i++) {
            scale.stackedBarPositive.push(scale.xAxisPosY);
            scale.stackedBarNegative.push(scale.xAxisPosY);
        }
    }

    function drawScale() {
        //X axis line
        ctx.lineWidth = xAxis.lineWidth;
        ctx.strokeStyle = xAxis.lineColor;
        ctx.beginPath();
        ctx.moveTo(width - graphMargin, scale.xAxisPosY);
        ctx.lineTo(width - graphMargin - scale.xAxisLength, scale.xAxisPosY);
        ctx.stroke();

        if (scale.xAxisRotateLabels > 0) {
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
        }
        else {
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
        }
        ctx.fillStyle = xAxis.fontColor;
        for (var i = 0; i < xAxis.labels.length; i++) {
            if (scale.xAxisRotateLabels > 0) {
                ctx.save();
                ctx.translate(scale.yAxis[0].PosX + i * scale.xAxisHop + (180 - scale.xAxisRotateLabels) * scale.xAxisHop / 180, scale.yAxis[0].PosMin + labelMargin);
                ctx.rotate(-(scale.xAxisRotateLabels * (Math.PI / 180)));
                ctx.fillText(xAxis.labels[i], 0, 0);
                ctx.restore();
            } else {
                ctx.fillText(xAxis.labels[i], scale.yAxis[0].PosX + i * scale.xAxisHop + scale.xAxisHop / 2, scale.yAxis[0].PosMin + labelMargin);
            }

            ctx.beginPath();
            ctx.moveTo(scale.yAxis[0].PosX + (i + 1) * scale.xAxisHop, scale.yAxis[0].PosMin);

            if (xAxis.showGridLines) {
                ctx.lineWidth = xAxis.gridLineWidth;
                ctx.strokeStyle = xAxis.gridLineColor;
                ctx.lineTo(scale.yAxis[0].PosX + (i + 1) * scale.xAxisHop, graphMargin);
            }
            else {
                ctx.lineTo(scale.yAxis[0].PosX + (i + 1) * scale.xAxisHop, scale.yAxis[0].PosMin);
            }
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(scale.yAxis[0].PosX + (i + 1/2) * scale.xAxisHop, scale.yAxis[0].PosMin);
            if (xAxis.showMiddleGridLines) {
                ctx.lineWidth = xAxis.gridMiddleLineWidth;
                ctx.strokeStyle = xAxis.gridMiddleLineColor;
                ctx.lineTo(scale.yAxis[0].PosX + (i + 1 / 2) * scale.xAxisHop, scale.yAxis[0].PosY);
            }
            ctx.stroke();
        }
        if (xAxis.showTitle) {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "bold " + xAxis.fontSize + "px " + xAxis.fontFamily;
            ctx.fillText(xAxis.title, scale.yAxis[0].PosX + (xAxis.labels.length / 2) * scale.xAxisHop, height - graphMargin - xAxis.fontSize / 2);
        }

        //Y axis
        ctx.lineWidth = yAxis[0].lineWidth;
        ctx.strokeStyle = yAxis[0].lineColor;
        ctx.beginPath();
        ctx.moveTo(scale.yAxis[0].PosX, scale.yAxis[0].PosMin);
        ctx.lineTo(scale.yAxis[0].PosX, scale.yAxis[0].PosY);
        ctx.stroke();


        for (var j = 0; j <= scale.yAxis[0].NumberOfSteps; j++) {
            ctx.beginPath();
            ctx.moveTo(scale.yAxis[0].PosX, scale.yAxis[0].PosMin - (j * scale.yAxis[0].Hop));
            if (yAxis[0].showGridLines) {
                ctx.lineWidth = xAxis.gridLineWidth;
                ctx.strokeStyle = xAxis.gridLineColor;
                ctx.lineTo(scale.yAxis[0].PosX + scale.xAxisLength, scale.yAxis[0].PosMin - (j * scale.yAxis[0].Hop));
            }
            else {
                ctx.lineTo(scale.yAxis[0].PosX, scale.yAxis[0].PosMin - (j * scale.yAxis[0].Hop));
            }
            ctx.stroke();

            if (yAxis[0].showLabels) {
                ctx.textBaseline = "middle";
                ctx.font = yAxis[0].fontStyle + " " + yAxis[0].fontSize + "px " + yAxis[0].fontFamily;
                if (rotated) {
                    ctx.textAlign = "center";
                    ctx.save();
                    ctx.translate(scale.yAxis[0].PosX - graphMargin, scale.yAxis[0].PosMin - (j * scale.yAxis[0].Hop));
                    ctx.rotate((-1 * Math.PI / 2));
                    ctx.fillText(scale.yAxis[0].Labels[j], 0, 0);
                    ctx.restore();
                } else {
                    ctx.textAlign = "right";
                    ctx.fillText(scale.yAxis[0].Labels[j], scale.yAxis[0].PosX - graphMargin, scale.yAxis[0].PosMin - (j * scale.yAxis[0].Hop));
                }
            }
        }
        if (yAxis[0].showTitle) {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "bold " + yAxis[0].fontSize + "px " + yAxis[0].fontFamily;
            ctx.save();
            ctx.translate(graphMargin + yAxis[0].fontSize/2, scale.yAxis[0].PosMin - scale.yAxis[0].NumberOfSteps * scale.yAxis[0].Hop / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(yAxis[0].title, 0, 0);
            ctx.restore();
        }
    }
    
    function populateLabels() {
        for (var i = 0; i <= scale.yAxis[0].NumberOfSteps; i++) {
            scale.yAxis[0].Labels.push(Charts.template(yAxis[0].labelTemplate, { value: scale.yAxis[0].Min + (scale.yAxis[0].StepValue * i) }));
        }
    }

    return scale;
};