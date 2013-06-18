Chart.prototype.Scale = function (ctx, yAxis, xAxis, height, width, rotated) {

    var graphMargin = 5;
    var labelMargin = 5;

    var scale = {
        // yAxis bottom position
        yAxisPosMin: 0,
        // yAxis length
        yAxisLength: 0,
        // yAxis space between 2 labels
        yAxisHop: 0,
        yAxis: [{
            LabelWidth: 0,
            LabelPosition: 1,
            // yAxis top left position
            PosX: 0,
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
        },
        {
            LabelWidth: 0,
            LabelPosition: -1,
            // yAxis top left position
            PosX: 0,
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

        calculateOffset: function(val, yAxisIndex) {
            var outerValue = scale.yAxis[yAxisIndex].NumberOfSteps * scale.yAxis[yAxisIndex].StepValue;
            var adjustedValue = val - scale.yAxis[yAxisIndex].Base;
            var scalingFactor = capValue(adjustedValue / outerValue, 1, -1);
            return (scale.yAxisHop * scale.yAxis[yAxisIndex].NumberOfSteps) * scalingFactor;
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
    for (var y in yAxis) {
        scale.yAxis[y].Base = yAxis[y].baseValue;

        var rangeOrderOfMagnitude = Math.floor(Math.log(Math.max(yAxis[y].maxValue - scale.yAxis[y].Base, scale.yAxis[y].Base - yAxis[y].minValue)) / Math.LN10);

        scale.yAxis[y].Min = Math.floor(10 * yAxis[y].minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude) / 10;
        scale.yAxis[y].Max = Math.ceil(10 * yAxis[y].maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude) / 10;
        if (scale.yAxis[0].NumberOfSteps == 0) {
            scale.yAxis[y].StepValue = Math.pow(10, rangeOrderOfMagnitude);
            scale.yAxis[y].NumberOfSteps = Math.round((scale.yAxis[y].Max - scale.yAxis[y].Min) / scale.yAxis[y].StepValue);
            //Compare number of steps to the max and min for that size yAxis, and add in half steps if need be.	        
            while (scale.yAxis[y].NumberOfSteps < yAxis[y].minSteps) {
                scale.yAxis[y].StepValue /= 2;
                scale.yAxis[y].NumberOfSteps = Math.round((scale.yAxis[y].Max - scale.yAxis[y].Min) / scale.yAxis[y].StepValue);
            }
        } else {
            scale.yAxis[y].NumberOfSteps = scale.yAxis[0].NumberOfSteps;
            scale.yAxis[y].StepValue = (yAxis[y].maxValue - yAxis[y].minValue) / scale.yAxis[0].NumberOfSteps;
        }

        //populateLabels
        for (var i = 0; i <= scale.yAxis[y].NumberOfSteps; i++) {
            scale.yAxis[y].Labels.push(Charts.template(yAxis[y].labelTemplate, { value: scale.yAxis[y].Min + (scale.yAxis[y].StepValue * i) }));
        }
    }
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
        var totalYAxisText = 1;
        //if we are showing the labels
        for (var y in yAxis) {
            var longestText = 1;
            if (yAxis[y].showLabels) {
                ctx.font = yAxis[y].fontStyle + " " + yAxis[y].fontSize + "px " + yAxis[y].fontFamily;
                for (var i = 0; i < scale.yAxis[y].Labels.length; i++) {
                    var measuredText = ctx.measureText(scale.yAxis[y].Labels[i]).width;
                    longestText = (measuredText > longestText) ? measuredText : longestText;
                }
                //Add a little extra padding from the y axis
                longestText += labelMargin;
            }
            totalYAxisText += longestText;

            if (rotated) {
                scale.yAxis[y].PosY = graphMargin + longestText / 2;
                scale.yAxis[y].LabelWidth = graphMargin + yAxis[y].fontSize + labelMargin;
            } else {
                scale.yAxis[y].LabelWidth = graphMargin + longestText;
                scale.yAxis[y].PosY = graphMargin + yAxis[y].fontSize / 2 + labelMargin;
            }
            if (yAxis[y].showTitle) {
                scale.yAxis[y].LabelWidth = scale.yAxis[y].LabelWidth + yAxis[y].fontSize + labelMargin;
            }
            if (y == 0) {
                scale.yAxis[y].PosX = scale.yAxis[y].LabelWidth;
            } else {
                scale.yAxis[y].PosX = width - scale.yAxis[y].LabelWidth;
            }
        }
        var maxSize;
        scale.xAxisLabelHeight = widestXLabel + labelMargin;
        maxSize = height - 2 * graphMargin - scale.xAxisLabelHeight - longestText / 2;
        if (xAxis.showTitle) {
            maxSize = maxSize - xAxis.fontSize - labelMargin;
        }
        scale.xAxisLength = width;
        for (var y in yAxis) {
            scale.yAxisLength = maxSize;
            scale.yAxisPosMin = scale.yAxisLength + scale.yAxis[y].PosY;
            scale.xAxisPosY = scale.yAxisPosMin;
            scale.yAxisHop = scale.yAxisLength / scale.yAxis[y].NumberOfSteps;
            scale.xAxisLength -= scale.yAxis[y].LabelWidth;
            scale.xAxisHop = scale.xAxisLength / (xAxis.labels.length);
            if (scale.yAxis[y].Min < scale.yAxis[y].Base && scale.yAxis[y].Max > scale.yAxis[y].Base) {
                scale.xAxisPosY = scale.yAxisPosMin - scale.yAxisLength * (((scale.yAxis[0].Min - scale.yAxis[0].Base) * -1) / (scale.yAxis[0].NumberOfSteps * scale.yAxis[0].StepValue));
            }
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
        ctx.moveTo(scale.yAxis[1].PosX, scale.xAxisPosY);
        ctx.lineTo(scale.yAxis[0].PosX, scale.xAxisPosY);
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
                ctx.translate(scale.yAxis[0].PosX + i * scale.xAxisHop + (180 - scale.xAxisRotateLabels) * scale.xAxisHop / 180, scale.yAxisPosMin + labelMargin);
                ctx.rotate(-(scale.xAxisRotateLabels * (Math.PI / 180)));
                ctx.fillText(xAxis.labels[i], 0, 0);
                ctx.restore();
            } else {
                ctx.fillText(xAxis.labels[i], scale.yAxis[0].PosX + i * scale.xAxisHop + scale.xAxisHop / 2, scale.yAxisPosMin + labelMargin);
            }

            if (xAxis.showGridLines) {
                ctx.beginPath();
                ctx.moveTo(scale.yAxis[0].PosX + (i + 1) * scale.xAxisHop, scale.yAxisPosMin);
                ctx.lineWidth = xAxis.gridLineWidth;
                ctx.strokeStyle = xAxis.gridLineColor;
                ctx.lineTo(scale.yAxis[0].PosX + (i + 1) * scale.xAxisHop, scale.yAxis[0].PosY);
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.moveTo(scale.yAxis[0].PosX + (i + 1/2) * scale.xAxisHop, scale.yAxisPosMin);
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
        for (var y in yAxis) {
            ctx.lineWidth = yAxis[y].lineWidth;
            ctx.strokeStyle = yAxis[y].lineColor;
            ctx.beginPath();
            ctx.moveTo(scale.yAxis[y].PosX, scale.yAxisPosMin);
            ctx.lineTo(scale.yAxis[y].PosX, scale.yAxis[y].PosY);
            ctx.stroke();


            for (var j = 0; j <= scale.yAxis[y].NumberOfSteps; j++) {
                if (yAxis[y].showGridLines) {
                    ctx.beginPath();
                    ctx.moveTo(scale.yAxis[0].PosX, scale.yAxisPosMin - (j * scale.yAxisHop));
                    ctx.lineWidth = xAxis.gridLineWidth;
                    ctx.strokeStyle = xAxis.gridLineColor;
                    ctx.lineTo(scale.yAxis[1].PosX, scale.yAxisPosMin - (j * scale.yAxisHop));
                    ctx.stroke();
                }

                if (yAxis[y].showLabels) {
                    ctx.textBaseline = "middle";
                    ctx.font = yAxis[y].fontStyle + " " + yAxis[y].fontSize + "px " + yAxis[y].fontFamily;
                    if (rotated) {
                        ctx.textAlign = "center";
                        ctx.save();
                        ctx.translate(scale.yAxis[y].PosX - scale.yAxis[y].LabelPosition * (graphMargin + yAxis[y].fontSize / 2), scale.yAxisPosMin - (j * scale.yAxisHop));
                        ctx.rotate((-1 * Math.PI / 2));
                        ctx.fillText(scale.yAxis[y].Labels[j], 0, 0);
                        ctx.restore();
                    } else {
                        ctx.textAlign = scale.yAxis[y].LabelPosition == 1 ? "right" : "left";
                        ctx.fillText(scale.yAxis[y].Labels[j], scale.yAxis[y].PosX - scale.yAxis[y].LabelPosition * graphMargin, scale.yAxisPosMin - (j * scale.yAxisHop));
                    }
                }
            }
            if (yAxis[y].showTitle) {
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = "bold " + yAxis[y].fontSize + "px " + yAxis[y].fontFamily;
                ctx.save();
                if (y == 0) {
                    ctx.translate(graphMargin + yAxis[y].fontSize / 2, scale.yAxisPosMin - scale.yAxis[y].NumberOfSteps * scale.yAxisHop / 2);
                    ctx.rotate(-Math.PI / 2);
                } else {
                    ctx.translate(width - graphMargin - yAxis[y].fontSize / 2, scale.yAxisPosMin - scale.yAxis[y].NumberOfSteps * scale.yAxisHop / 2);
                    if (rotated) {
                        ctx.rotate(-Math.PI / 2);
                    } else {
                        ctx.rotate(Math.PI / 2);
                    }
                }
                ctx.fillText(yAxis[y].title, 0, 0);
                ctx.restore();
            }
        }
    }
    
    return scale;
};