XYChart.prototype.Scale = function (ctx, yAxis, xAxis, height, width, rotated) {

    var scale = {
        rotated: rotated,
        graphMargin: 5,
        labelMargin: 5,
        // yAxis bottom position
        yAxisPosMin: 0,
        // yAxis length
        yAxisLength: 0,
        // yAxis space between 2 labels
        yAxisHop: 0,
        yAxisPosY: 0,
        yAxis: [{
            LabelWidth: 0,
            LabelPosition: 1,
            // yAxis top left position
            PosX: 0,
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
            Labels: []
        },
        {
            LabelWidth: 5,
            LabelPosition: -1,
            // yAxis top left position
            PosX: width - 5,
            PosY: 0,
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
            Labels: []
        }],

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

        calculateOffset: function (val, yAxisIndex) {
            var outerValue = scale.yAxis[yAxisIndex].NumberOfSteps * scale.yAxis[yAxisIndex].StepValue;
            var adjustedValue = val - scale.yAxis[yAxisIndex].Base;
            var scalingFactor = capValue(adjustedValue / outerValue, 1, -1);
            return (scale.yAxisHop * scale.yAxis[yAxisIndex].NumberOfSteps) * scalingFactor;
        },
        stackedBaseReset: function () {
            for (var i = 0; i < xAxis.labels.length; i++) {
                scale.stackedBarPositive[i] = scale.xAxisPosY;
                scale.stackedBarNegative[i] = scale.xAxisPosY;
            }
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
        yStackedPos: function (val, pct, yAxisIndex, xAxisLabelIndex) {
            return scale.yStackedBase(val, xAxisLabelIndex, yAxisIndex) - pct * (scale.calculateOffset(val, yAxisIndex));
        },
        yPos: function (val, pct, yAxisIndex) {
            return scale.xAxisPosY - pct * (scale.calculateOffset(val, yAxisIndex));
        },
        xPos: function (xAxisLabelIndex, yAxisIndex, middle) {
            return scale.yAxis[0].PosX + (scale.xAxisHop * xAxisLabelIndex) + (middle ? (scale.xAxisHop * 0.5) : 0);
        },
        yVal: function (ePosy, yAxisIndex) {
            if (ePosy > scale.yAxisPosMin || ePosy < scale.yAxisPosMin - scale.yAxisLength) {
                return NaN;
            } else {
                var scalePos = ePosy - scale.yAxisPosMin + scale.yAxisLength;
                return scale.yAxis[yAxisIndex].Max - (scale.yAxis[yAxisIndex].Max - scale.yAxis[yAxisIndex].Min) * scalePos / scale.yAxisLength;
            }
        },
        xVal: function (ePosX) {
            if (ePosX < scale.yAxis[0].PosX || ePosX > scale.yAxis[0].PosX + scale.xAxisLength) {
                return NaN;
            } else {
                return Math.floor((ePosX - scale.yAxis[0].PosX) / scale.xAxisHop);
            }
        },
        bar: function(ePosX) {
            var xval = this.xVal(ePosX);
            if (xval == NaN) return NaN;
            var barOffset = ePosX - (xval * scale.xAxisHop) - scale.yAxis[0].PosX;
            if (barOffset < scale.barValueSpacing) {
                return NaN;
            }
            if (barOffset > scale.xAxisHop - scale.barValueSpacing) {
                return NaN;
            }
            return Math.floor((barOffset - scale.barValueSpacing) / (scale.barWidth + scale.barSpacing));
        }
    };

    for (var y in yAxis.lines) {

        yAxis.lines[y].minValue = Math.min(yAxis.lines[y].minValue, yAxis.lines[y].baseValue);
        yAxis.lines[y].maxValue = Math.max(yAxis.lines[y].maxValue, yAxis.lines[y].baseValue);

        scale.yAxis[y].Base = yAxis.lines[y].baseValue;

        var rangeOrderOfMagnitude = Math.max(0, Math.floor(Math.log(Math.max(yAxis.lines[y].maxValue - scale.yAxis[y].Base, scale.yAxis[y].Base - yAxis.lines[y].minValue)) / Math.LN10));

        scale.yAxis[y].Min = Math.floor(yAxis.lines[y].minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude);
        scale.yAxis[y].Max = Math.ceil(yAxis.lines[y].maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude);
        if (scale.yAxis[y].Min == scale.yAxis[y].Max) scale.yAxis[y].Max += Math.pow(10, rangeOrderOfMagnitude);
        if (scale.yAxis[0].NumberOfSteps == 0) {
            scale.yAxis[y].StepValue = Math.pow(10, rangeOrderOfMagnitude);
            scale.yAxis[y].NumberOfSteps = Math.round((scale.yAxis[y].Max - scale.yAxis[y].Min) / scale.yAxis[y].StepValue);
            //Compare number of steps to the max and min for that size yAxis, and add in half steps if need be.	        
            while (scale.yAxis[y].NumberOfSteps < yAxis.minSteps) {
                scale.yAxis[y].StepValue /= 2;
                scale.yAxis[y].NumberOfSteps = Math.round((scale.yAxis[y].Max - scale.yAxis[y].Min) / scale.yAxis[y].StepValue);
            }
        } else {
            if (scale.yAxis[0].Min < scale.yAxis[0].Base && scale.yAxis[y].Min <= scale.yAxis[y].Base) {
                var p = (scale.yAxis[0].Base - scale.yAxis[0].Min) / (scale.yAxis[0].Max - scale.yAxis[0].Base);
                var min = -1 * p * (scale.yAxis[y].Max - scale.yAxis[y].Base);
                var max = (1 - p) * (scale.yAxis[y].Base - scale.yAxis[y].Min);
                if (min < scale.yAxis[y].Min) {
                    scale.yAxis[y].Min = scale.yAxis[y].Base + min;
                } else {
                    scale.yAxis[y].Max = scale.yAxis[y].Base + max;
                }
            }
            scale.yAxis[y].NumberOfSteps = scale.yAxis[0].NumberOfSteps;
            scale.yAxis[y].StepValue = Math.ceil((scale.yAxis[y].Max - scale.yAxis[y].Min) / scale.yAxis[0].NumberOfSteps);
            scale.yAxis[y].Min = scale.yAxis[0].Base - scale.yAxis[y].StepValue * ((scale.yAxis[0].Base - scale.yAxis[0].Min) / scale.yAxis[0].StepValue);
            scale.yAxis[y].Max = scale.yAxis[0].Base + scale.yAxis[y].StepValue * ((scale.yAxis[0].Max - scale.yAxis[0].Base) / scale.yAxis[0].StepValue);
        }

        //populateLabels
        for (var i = 0; i <= scale.yAxis[y].NumberOfSteps; i++) {
            scale.yAxis[y].Labels.push(Charts.template(yAxis.lines[y].labelTemplate, { value: scale.yAxis[y].Min + (scale.yAxis[y].StepValue * i) }));
        }
    }
    // calculateDrawingSizes() {
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
        if (scale.rotated) {
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
    var totalYAxisText = 1;
    var maxPosY = 0;
    //if we are showing the labels
    for (var y in yAxis.lines) {
        var longestText = 1;
        if (yAxis.lines[y].showLabels) {
            ctx.font = yAxis.lines[y].fontStyle + " " + yAxis.lines[y].fontSize + "px " + yAxis.lines[y].fontFamily;
            for (var i = 0; i < scale.yAxis[y].Labels.length; i++) {
                var measuredText = ctx.measureText(scale.yAxis[y].Labels[i]).width;
                longestText = (measuredText > longestText) ? measuredText : longestText;
            }
            //Add a little extra padding from the y axis
            longestText += scale.labelMargin;
        }
        totalYAxisText += longestText;

        if (scale.rotated) {
            maxPosY = Math.max(maxPosY, scale.graphMargin + longestText / 2);
            scale.yAxis[y].LabelWidth = scale.graphMargin + yAxis.lines[y].fontSize + scale.labelMargin;
        } else {
            scale.yAxis[y].LabelWidth = scale.graphMargin + longestText;
            maxPosY = Math.max(maxPosY, scale.graphMargin + yAxis.lines[y].fontSize / 2 + scale.labelMargin);
        }
        if (yAxis.lines[y].showTitle) {
            scale.yAxis[y].LabelWidth = scale.yAxis[y].LabelWidth + yAxis.lines[y].fontSize + scale.labelMargin;
        }
        if (y == 0) {
            scale.yAxis[y].PosX = scale.yAxis[y].LabelWidth;
        } else {
            scale.yAxis[y].PosX = width - scale.yAxis[y].LabelWidth;
        }
    }
    scale.yAxisPosY = maxPosY;
    var maxSize;
    scale.xAxisLabelHeight = widestXLabel + scale.labelMargin;
    maxSize = height - 2 * scale.graphMargin - scale.xAxisLabelHeight - longestText / 2;
    if (xAxis.showTitle) {
        maxSize = maxSize - xAxis.fontSize - scale.labelMargin;
    }
    scale.xAxisLength = width;
    scale.yAxisLength = maxSize;
    scale.yAxisPosMin = scale.yAxisLength + scale.yAxisPosY;
    scale.xAxisPosY = scale.yAxisPosMin;
    scale.yAxisHop = scale.yAxisLength / scale.yAxis[0].NumberOfSteps;
    for (var y in scale.yAxis) {
        scale.xAxisLength -= scale.yAxis[y].LabelWidth;
        scale.xAxisHop = scale.xAxisLength / (xAxis.labels.length);
    }
    if (scale.yAxis[0].Min < scale.yAxis[0].Base && scale.yAxis[0].Max > scale.yAxis[0].Base) {
        scale.xAxisPosY = scale.yAxisPosMin - scale.yAxisLength * (((scale.yAxis[0].Min - scale.yAxis[0].Base) * -1) / (scale.yAxis[0].NumberOfSteps * scale.yAxis[0].StepValue));
    }

    for (var i = 0; i < xAxis.labels.length; i++) {
        scale.stackedBarPositive.push(scale.xAxisPosY);
        scale.stackedBarNegative.push(scale.xAxisPosY);
    }

    return scale;
};

XYChart.prototype.DrawScale = function (ctx, yAxis, xAxis, height, width, scale) {    
    //X axis line
    ctx.lineWidth = xAxis.lineWidth;
    ctx.strokeStyle = xAxis.lineColor;
    ctx.beginPath();
    if (xAxis.showLine) {
        ctx.moveTo(scale.yAxis[1].PosX, scale.xAxisPosY);
        ctx.lineTo(scale.yAxis[0].PosX, scale.xAxisPosY);
        ctx.stroke();
    }
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
        if (xAxis.showLabels) {
            if (scale.xAxisRotateLabels > 0) {
                ctx.save();
                ctx.translate(scale.yAxis[0].PosX + i * scale.xAxisHop + (180 - scale.xAxisRotateLabels) * scale.xAxisHop / 180, scale.yAxisPosMin + scale.labelMargin);
                ctx.rotate(-(scale.xAxisRotateLabels * (Math.PI / 180)));
                ctx.fillText(xAxis.labels[i], 0, 0);
                ctx.restore();
            } else {
                ctx.fillText(xAxis.labels[i], scale.yAxis[0].PosX + i * scale.xAxisHop + scale.xAxisHop / 2, scale.yAxisPosMin + scale.labelMargin);
            }
        }

        if (xAxis.showGridLines) {
            ctx.beginPath();
            ctx.moveTo(scale.yAxis[0].PosX + (i + 1) * scale.xAxisHop, scale.yAxisPosMin);
            ctx.lineWidth = xAxis.gridLineWidth;
            ctx.strokeStyle = xAxis.gridLineColor;
            ctx.lineTo(scale.yAxis[0].PosX + (i + 1) * scale.xAxisHop, scale.yAxisPosY);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(scale.yAxis[0].PosX + (i + 1 / 2) * scale.xAxisHop, scale.yAxisPosMin);
        if (xAxis.showMiddleGridLines) {
            ctx.lineWidth = xAxis.gridMiddleLineWidth;
            ctx.strokeStyle = xAxis.gridMiddleLineColor;
            ctx.lineTo(scale.yAxis[0].PosX + (i + 1 / 2) * scale.xAxisHop, scale.yAxisPosY);
        }
        ctx.stroke();
    }
    if (xAxis.showTitle) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold " + xAxis.fontSize + "px " + xAxis.fontFamily;
        ctx.fillText(xAxis.title, scale.yAxis[0].PosX + (xAxis.labels.length / 2) * scale.xAxisHop, height - scale.graphMargin - xAxis.fontSize / 2);
    }

    //Y axis
    for (var y in yAxis.lines) {
        ctx.lineWidth = yAxis.lines[y].lineWidth;
        ctx.strokeStyle = yAxis.lines[y].lineColor;
        ctx.beginPath();
        if (yAxis.lines[y].showLine) {
            ctx.moveTo(scale.yAxis[y].PosX, scale.yAxisPosMin);
            ctx.lineTo(scale.yAxis[y].PosX, scale.yAxisPosY);
            ctx.stroke();
        }
        for (var j = 0; j <= scale.yAxis[y].NumberOfSteps; j++) {
            if (yAxis.lines[y].showLabels) {
                ctx.textBaseline = "middle";
                ctx.font = yAxis.lines[y].fontStyle + " " + yAxis.lines[y].fontSize + "px " + yAxis.lines[y].fontFamily;
                if (scale.rotated) {
                    ctx.textAlign = "center";
                    ctx.save();
                    ctx.translate(scale.yAxis[y].PosX - scale.yAxis[y].LabelPosition * (scale.graphMargin + yAxis.lines[y].fontSize / 2), scale.yAxisPosMin - (j * scale.yAxisHop));
                    ctx.rotate((-1 * Math.PI / 2));
                    ctx.fillText(scale.yAxis[y].Labels[j], 0, 0);
                    ctx.restore();
                } else {
                    ctx.textAlign = scale.yAxis[y].LabelPosition == 1 ? "right" : "left";
                    ctx.fillText(scale.yAxis[y].Labels[j], scale.yAxis[y].PosX - scale.yAxis[y].LabelPosition * scale.graphMargin, scale.yAxisPosMin - (j * scale.yAxisHop));
                }
            }
        }
        if (yAxis.lines[y].showTitle) {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "bold " + yAxis.lines[y].fontSize + "px " + yAxis.lines[y].fontFamily;
            ctx.save();
            if (y == 0) {
                ctx.translate(scale.graphMargin + yAxis.lines[y].fontSize / 2, scale.yAxisPosMin - scale.yAxis[y].NumberOfSteps * scale.yAxisHop / 2);
                ctx.rotate(-Math.PI / 2);
            } else {
                ctx.translate(width - scale.graphMargin - yAxis.lines[y].fontSize / 2, scale.yAxisPosMin - scale.yAxis[y].NumberOfSteps * scale.yAxisHop / 2);
                if (scale.rotated) {
                    ctx.rotate(-Math.PI / 2);
                } else {
                    ctx.rotate(Math.PI / 2);
                }
            }
            ctx.fillText(yAxis.lines[y].title, 0, 0);
            ctx.restore();
        }
    }
    if (yAxis.showGridLines) {
        for (var j = 0; j <= scale.yAxis[0].NumberOfSteps; j++) {
            ctx.beginPath();
            ctx.moveTo(scale.yAxis[0].PosX, scale.yAxisPosMin - (j * scale.yAxisHop));
            ctx.lineWidth = yAxis.gridLineWidth;
            ctx.strokeStyle = yAxis.gridLineColor;
            ctx.lineTo(scale.yAxis[1].PosX, scale.yAxisPosMin - (j * scale.yAxisHop));
            ctx.stroke();
        }
    }
};
