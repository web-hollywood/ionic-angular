//
// Moxie chart library - Version 0.31
//

var moxiechart;
moxiechart = {

    get: function(options/*jsonURL, auth, callback, errorCallback*/) {
        if (window.console) console.log("GET ", options.jsonURL, options.auth);
        var h = d3.json(options.jsonURL);
        
        if (options.auth) {
          h.header('Authorization', "Bearer " + options.auth);
        } else {
        	h.on("beforesend", function(request) { request.withCredentials = true; });
        }
        return h.get(function(err, data) {
			if (err) {
			    if (window.console) console.log(err);
			 	options.errorCallback();
			} else {
				options.callback(data);
			}
        });
    },

    createGaugeChart: function(chartWidth, divSelector, jsonURL, auth, options) {

        var modifier = chartWidth / 500;

        var margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        };

        var width = 500 * modifier - margin.left - margin.right;
        var height = 300 * modifier;
        var radius = width / 2;
        var barWidth = (60 * modifier * width) / (300 * modifier);
        var needlePadding = 25 * modifier;

        var fontSize = 18 * modifier;
        var fontWeight = 'bold';
        
        var initialChartCallback = function(data) {
        	
            if(!data || !data.gauge){
                if(window.console) console.log("Error in Gauge Chart: " + JSON.stringify(data));
                moxiechart.createChartError(divSelector, chartWidth);
                return;
            }
            
            var dataset = data.gauge.range;
            var value = data.gauge.current + 1; // positions are from 0, so need to add 1 for the percent value;
            var numberSections = dataset.length;
            var percentValue = value / numberSections - (1 / numberSections * 0.5);

            var needleClient;

            (function() {

                var percent = percentValue;

                if(options && options.refreshOnly && moxiechart.gaugeNeedles[jsonURL]) {
                    
                    var needle = moxiechart.gaugeNeedles[jsonURL];
                    needle.moveTo(percent);
                    
                } else {
                    
                    var numSections = 1;
                    var sectionPerc = 1 / numSections / 2;
                    var padRad = 0.025;
                    var chartInset = 10;
    
                    // Orientation of gauge:
                    var totalPercent = .75;
    
                    var el = d3.select(divSelector);
    
                    //Utility methods
                    var percToDeg = function(perc) {
                        return perc * 360;
                    };
    
                    var percToRad = function(perc) {
                        return degToRad(percToDeg(perc));
                    };
    
                    var degToRad = function(deg) {
                        return deg * Math.PI / 180;
                    };
    
                    // Create SVG element
                    var svg = el.append('svg')
                        .attr('width', width + margin.left + margin.right)
                        .attr('height', height + margin.top + margin.bottom)
                        .attr('font-family', 'Source Sans Pro');
    
                    // Add layer for the panel
                    var chart = svg.append('g')
                        .attr('transform', "translate(" + ((width + margin.left) / 2) + ", " + (height - margin.bottom - needlePadding) + ")");
    
                    for (var i = 0; i < numberSections; i++) {
                        chart.append('path').attr('class', "moxiechart_chartarc-" + i);
                    }
    
                    // draws each arc
                    perc = 0.5;
                    var next_start = totalPercent;
    
                    for (var i = 0; i < numberSections; i++) {
    
                        var arc = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth);
    
                        arcStartRad = percToRad(next_start);
                        arcEndRad = arcStartRad + percToRad(perc / numberSections);
                        next_start += perc / numberSections;
                        arc.startAngle(arcStartRad).endAngle(arcEndRad);
    
                        chart.select(".moxiechart_chartarc-" + i)
                            .attr('fill', dataset[i].color)
                            .attr('d', arc);
    
                        chart.append('text')
                            .attr('transform', function() {
    
                                var x = Math.round(arc.centroid()[0]);
                                var y = Math.round(arc.centroid()[1]);
    
                                return 'translate(' + x + ',' + y + ')';
    
                            })
                            .style("text-anchor", "middle")
                            .style("font-size", fontSize + "px")
                            .style("font-weight", fontWeight)
                            .text(dataset[i].text)
                            .style("fill", "666666");
                    }
    
                    var Needle = (function() {
    
                        //Helper function that returns the `d` value for moving the needle
                        var recalcPointerPos = function(perc) {
                            var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
                            thetaRad = percToRad(perc / 2);
                            centerX = 0;
                            centerY = 0;
                            topX = centerX - this.len * Math.cos(thetaRad);
                            topY = centerY - this.len * Math.sin(thetaRad);
                            leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
                            leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
                            rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
                            rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
    
                            return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
    
                        };
    
                        function Needle(el) {
                            this.el = el;
                            this.len = width / 2.5 - 10;
                            this.radius = this.len / 12;
                        }
    
                        Needle.prototype.render = function() {
                            this.el.append('circle')
                                .attr('cx', 0).attr('cy', 0)
                                .attr('r', this.radius)
                                .attr('fill', '#777');
                            return this.el.append('path')
                                .attr('class', 'moxiechart_needle')
                                .attr('id', 'client-needle')
                                .attr('d', recalcPointerPos.call(this, 0))
                                .attr('fill', '#777');;
                        };
    
                        Needle.prototype.moveTo = function(perc) {
                            var self,
                                oldValue = this.perc || 0;
    
                            this.perc = perc;
                            self = this;
    
                            // Reset pointer position
                            this.el.transition()
                                .delay(100)
                                .ease('quad')
                                .duration(200)
                                .select('.moxiechart_needle')
                                .tween('reset-progress', function() {
                                    return function(percentOfPercent) {
                                        var progress = (1 - percentOfPercent) * oldValue;
                                        return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
                                    };
                                });
    
                            this.el.transition()
                                .delay(300)
                                .ease('bounce')
                                .duration(1500)
                                .select('.moxiechart_needle')
                                .tween('progress', function() {
                                    return function(percentOfPercent) {
                                        var progress = percentOfPercent * perc;
                                        return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
                                    };
                                });
                        };
    
                        return Needle;
    
                    })();
    
                    needle = new Needle(chart);
                    needle.render();
                    needle.moveTo(percent);
                    
                    if(!moxiechart.gaugeNeedles) {
                        moxiechart.gaugeNeedles = {};
                    }
                    
                    // keep track of the needle object so we can refresh the chart later 
                    moxiechart.gaugeNeedles[jsonURL] = needle;
                }

            })();
        }
        
        var errorCallback = function(){
        	moxiechart.createChartError(divSelector, chartWidth);
        }
        
        // Make the call to get the data and then generate the chart
        this.get({
			jsonURL: jsonURL,
			auth: auth,
			callback: initialChartCallback,
			errorCallback: errorCallback
        });
    },

    createReadingGrowthChart: function(width, divSelector, jsonURL, options) {

    	// Give priority to the parameter of width
    	if(options.width) width = options.width;
	
        var modifier = width / 600;

        var fontWeight = "normal";
        var bandPadding = 5 * modifier;
        if (modifier < 1) {
            fontWeight = "bold";
            bandPadding = 0;
        }

        var legendFontSize = 16 * modifier;
        var titleFontSize = 36 * modifier;
        var tickFontSize = 16 * modifier;

        var margin = {
                top: 10,
                right: 30 * modifier,
                bottom: 0,
                left: 30 * modifier
            },
            legendHeight = 100 * modifier,
            titleHeight = 100 * modifier,
            outerWidth = 600 * modifier,
            outerHeight = 250 * modifier + legendHeight + titleHeight,
            width = outerWidth - margin.left - margin.right,
            height = outerHeight - margin.top - margin.bottom - legendHeight - titleHeight;

        var bubbleSizeMultiplier = 1.5 * modifier;
        var bubbleSizeMultiplierHover = 2.5 * modifier;

        var chartCallback = function(data) {

            if(!data || !data.data || !data.weeks || !data.readinglevels || !data.booklabels || !data.bands){
                if(window.console) console.log("Error in Reading Growth Chart: " + JSON.stringify(data));
                moxiechart.createChartError(divSelector, chartWidth);
                return;
            }
            
            var xCat = "date",
                yCat = "readinglevel",
                rCat = "pages";

            var dataset = data.data;
            var xAxisValues = data.weeks;
            var yAxisValues = data.readinglevels;

            var format = d3.time.format("%Y-%m-%d");

            var yMin = 0;
            var yMax = yAxisValues.length - 1;
            var xMin = moment(xAxisValues[0].date, "YYYY-MM-DD").subtract(1, 'd');
            var xMax = moment(xAxisValues[xAxisValues.length - 1].date, "YYYY-MM-DD").endOf('week');

            var currentSelectedBubble;
            
            var textLabels = [];
            var labelsToUse = Math.floor(data.weeks.length/6);
            if(labelsToUse < 1) labelsToUse = 1;
            
            for (var i = 0; i < data.weeks.length; i++) {
                if(i % labelsToUse == 0) {
                	textLabels.push(moment(data.weeks[i].date).format("MM/DD"));
                }
            }

            // Creates the x and y scale
            var x = d3.time.scale()
                .range([0, width])
                .domain([xMin, xMax]);

            var y = d3.scale.linear()
                .range([height, 0])
                .domain([yMin, yMax]);

            // Creates the x and both the  y axis
            var xAxis = d3.svg.axis()
                .scale(x)
                .ticks(d3.time.sundays, labelsToUse)
                .tickFormat(d3.time.format('%m/%d')) 
                .orient("top");

            var yAxis = d3.svg.axis()
                .scale(y)
                .ticks(yAxisValues.length)
                .tickFormat(function(d) {
                    return yAxisValues[d];
                })
                .orient("left");

            var yAxisRight = d3.svg.axis()
                .scale(y)
                .ticks(yAxisValues.length)
                .tickFormat(function(d) {
                    return yAxisValues[d];
                })
                .orient("right");

            // Measures the distance between the ticks so we can move the bands and grid lines down half a tick
            // This gives the illusion of the labels appearing in between the gridlines, but we keep the bubbles in
            // the same spot. We use values 0 and 1, rather than the first and second y axis position, as our axis could
            // potentially be split into fractions rather than integers, however format on the y axis will fix that later
            var tickDistance = y(0) - y(1);

            // Tooltips for the bubbles
            var tip = d3.tip()
                .attr('class', 'moxiechart_growth_d3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    var tooltip = "<span class='moxiechart_growth_d3-tip_title'>" + d.title + "</span>" +
                        "<br /><span class='moxiechart_growth_d3-tip_text'>Pages: " + d.pages + "</span>";
                    
                    if(d.estimated){
                    	tooltip += "<br /><span class='moxiechart_growth_d3-tip_text'>No Reading Level - Estimated as: " + d.readinglevel + "</span>";
                    } else {
                    	tooltip += "<br /><span class='moxiechart_growth_d3-tip_text'>Reading Level: " + d.readinglevel + "</span>";
                    }
                    
                    return tooltip;
                });

            // Sets the root element to be the div
            tip.rootElement(document.getElementsByClassName(divSelector.substring(1))[0]);
                        
            // creates and positions the svg that we draw the chart onto using the scatter div
            var svg = d3.select(divSelector)
                .append("svg")
                .style('background-color', 'white')
                .attr("width", outerWidth)
                .attr("height", outerHeight)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + (margin.top + titleHeight) + ")");

            d3.select(divSelector).on("click", function() {
            	if(currentSelectedBubble){
            		// When clicking elsewhere on the chart, hide the tooltip
            		tip.hide(currentSelectedBubble.d);
            		d3.select(currentSelectedBubble.target).attr("r", getBubbleSize(bubbleSizeMultiplier, currentSelectedBubble.d[rCat], data.booklabels));
            		currentSelectedBubble = undefined;
            	}
            });

            // Does a call to create the tooltips
            svg.call(tip);
                        
            // Draw the y Grid lines
            svg.append("g")
                .attr("class", "moxiechart_growth_grid")
                .attr("transform", "translate(0," + tickDistance / 2 + ")")
                .call(make_y_axis()
                    .tickSize(-width, 0, 0)
                    .tickFormat("")
                );

            // We work out the size of each of the labels so we can centre them along the top of the x axis
            var results = moxiechart._getLabelWidths(textLabels, "moxiechart_growth_tick", svg, tickFontSize);            
            var textWidth = results.labelWidths;
            var textHeight = results.textHeight;

            // Draws the x axis ticks and moves them so they are center aligned
            svg.append("g")
                .attr("class", "x moxiechart_growth_axis")
                .attr("transform", "translate(0, 0)")
                .call(xAxis)
                .selectAll("text")
                .style("font-size", tickFontSize + "px")
                .style("font-weight", fontWeight);

            // calculate the width of the days in the timeScale
            function daysToPixels(days, timeScale) {
                var d1 = new Date();
                return x(d3.time.day.offset(d1, days)) - x(d1);
            }

            // Draws the first y axis to the chart
            svg.append("g")
                .classed("y moxiechart_growth_axis", true)
                .call(yAxis)
                .style("font-size", tickFontSize + "px")
                .style("font-weight", fontWeight)
                .selectAll('text')
                .style('text-anchor', 'middle');

            // Draws the second y axis to the chart
            svg.append("g")
                .attr("transform", "translate(" + width + " ,0)")
                .classed("y moxiechart_growth_axis", true)
                .call(yAxisRight)
                .style("font-size", tickFontSize + "px")
                .style("font-weight", fontWeight)
                .selectAll('text')
                .style('text-anchor', 'middle');

            // Creates the dataset of points to draw and join for the bands
            var areaDataset = [];
            for (var i = 0; i < data.bands.length; i++) {
                
                // Do some validation, because we cannot draw an invalid band
                if(!data.bands[i].startlow 
                        || !data.bands[i].starthigh
                        || !data.bands[i].endhigh
                        || !data.bands[i].endlow) continue;
                
                areaDataset.push({
                    "position": i,
                    "points": [{
                        x: 0 + bandPadding,
                        y: y(translateCategoryIntoNumber(data.bands[i].startlow)) + tickDistance / 2
                    }, {
                        x: 0 + bandPadding,
                        y: y(translateCategoryIntoNumber(data.bands[i].starthigh)) + tickDistance / 2
                    }, {
                        x: width - bandPadding,
                        y: y(translateCategoryIntoNumber(data.bands[i].endhigh)) + tickDistance / 2
                    }, {
                        x: width - bandPadding,
                        y: y(translateCategoryIntoNumber(data.bands[i].endlow)) + tickDistance / 2
                    }]
                });
            }

            // Draws the bands
            svg.selectAll("polygon")
                .data(areaDataset)
                .enter().append("polygon")
                .attr("points", function(d) {
                    return d.points.map(function(d) {
                        return [d.x, d.y].join(",");
                    }).join(" ");
                })
                .attr("class", function(d) {
                    return "moxiechart_growth_band" + d.position;
                });

            // Draw the scatter dots
            svg.selectAll(".moxiechart_growth_dot")
                .data(dataset)
                .enter().append("circle")
                .attr("class", function(d){
                	if(d.estimated){
                		return "moxiechart_growth_dot_no_level";
                	} else {
                		return "moxiechart_growth_dot";
                	}
                })
                .attr("r", function(d) {
                    return getBubbleSize(bubbleSizeMultiplier, d[rCat], data.booklabels);
                })
                .attr("cx", function(d) {
                    return x(format.parse(d[xCat]));
                })
                .attr("cy", function(d) {
                    return y(translateCategoryIntoNumber(d[yCat]));
                })
                .on('click', function(d) {
                	d3.event.stopPropagation();
                	
                	// If there is a previously shown tooltip, hide it and reduce the bubble size
                	if(currentSelectedBubble){
            			tip.hide(currentSelectedBubble.d);
                    	d3.select(currentSelectedBubble.target).attr("r", getBubbleSize(bubbleSizeMultiplier, currentSelectedBubble.d[rCat], data.booklabels));
                    	currentSelectedBubble = undefined;
                	}
                	
                	currentSelectedBubble = {
                		d: d,
                		target: d3.event.target
                	};
                	
		            var scrollOffset = moxiechart._getScrollOffset(divSelector);
            
                    tip.show(d, scrollOffset);
                    
		            d3.selectAll('.moxiechart_growth_d3-tip_text')
		            	.style('font-size', '14px');
		            d3.selectAll('.moxiechart_growth_d3-tip_title')
		            	.style('font-size', '18px');
                    
                    d3.select(d3.event.target).attr("r", getBubbleSize(bubbleSizeMultiplierHover, d[rCat], data.booklabels));
                });

            // Draw the upper line on the chart
            svg.append("line")
                .attr('class', 'moxiechart_growth_bottomlineLegend')
                .attr("x1", 0)
                .attr("y1", 0 - titleHeight)
                .attr("x2", width)
                .attr("y2", 0 - titleHeight);


            var titlePadding = 10 * modifier;
            svg.append("text")
                .attr("class", "moxiechart_growth_titleText")
                .attr("x", width / 2)
                .attr("y", 0 - (titleHeight / 2) - titlePadding)
                .attr("text-anchor", "middle")
                .text("Reading Growth")
                .style('font-size', titleFontSize + "px");

            // Bottom line along the chart
            svg.append("line")
                .attr('class', 'moxiechart_growth_bottomline')
                .attr("x1", 0)
                .attr("y1", height + tickDistance / 2)
                .attr("x2", width)
                .attr("y2", height + tickDistance / 2);

            // Work out the text widths for the legend labels
            // The largest text width will be the minimum width for 
            // all the labels            
            var result = moxiechart._getLabelWidths(data.booklabels, 'moxiechart_growth_textLegend', svg);
            var labelWidths = result.labelWidths;
            var maxWidth = result.maxWidth;

            var standardLegendSpacing = Math.ceil(10 * modifier);
            var legendTitleWidth = Math.ceil(45.640625 * modifier); // this is hardcoded width of the text 'PAGES'
            var estimateWidth = Math.ceil(23.671875 * modifier);
            
            var legendWidth = estimateWidth;
            for(var i=0; i<labelWidths.length; i++){
            	
            	// See what is bigger, label width or bubble radius
            	var labelWidth = Math.ceil(labelWidths[i] * modifier);
            	var radius = Math.ceil(getBubbleSize(bubbleSizeMultiplier, 50 + 100 * i, data.booklabels));
            	
            	legendWidth += (Math.max(labelWidth, radius*2) + standardLegendSpacing);
            }
            
            var largestRadius = Math.ceil(getBubbleSize(bubbleSizeMultiplier, 50 + 100 * (data.booklabels.length - 1), data.booklabels));
            var maxRadiusSpace = 20 * modifier;
            var legendHeightPadding = Math.ceil(40 * modifier);
            var textHeightPadding = Math.ceil(35 * modifier);
            var leftPadding = (width - legendWidth) / 2;
            
            // This will keep track of where we are up to with drawing the legend
            var drawingPosition = leftPadding;
            
            // The title of the legend - we've hardcoded the width of this piece of text because it shouldn't change
            svg.append("text")
                .attr('class', 'moxiechart_growth_textLegend')
                .attr('x', drawingPosition - legendTitleWidth - standardLegendSpacing)
                .attr('y', height + legendHeightPadding + textHeightPadding)
                .text("PAGES")
                .style('font-size', legendFontSize + "px")
                .style("font-weight", fontWeight);
            
            // Draws the blue dot for estimated levels
            var blueRadius = Math.ceil(getBubbleSize(bubbleSizeMultiplier, 50, data.booklabels));
            svg.append("circle")
	            .attr('class', 'moxiechart_growth_dot_no_level')
	            .attr("cx", drawingPosition + ((estimateWidth/2)))
	            .attr("cy", height + legendHeightPadding + maxRadiusSpace - blueRadius)
	            .attr("r", blueRadius);
            
            svg.append("text")
	            .attr('class', 'moxiechart_growth_textLegend')
	            .attr('x', drawingPosition)
	            .attr('y', height + legendHeightPadding + textHeightPadding)
	            .text("Est")
	            .style('font-size', legendFontSize + "px")
	            .style("font-weight", fontWeight);
            drawingPosition += (estimateWidth + standardLegendSpacing);

            var currentBubblePosition = 0;
            for(var i=0; i<data.booklabels.length; i++){
            	
            	// See which is bigger, the radius or the text. Depending on whats bigger, will depend on how we
            	// center things
            	var currentTextWidth = Math.ceil(labelWidths[i] * modifier);
            	var radius = Math.ceil(getBubbleSize(bubbleSizeMultiplier, 50 + 100 * i, data.booklabels));
            	var currentLegendPortionWidth = Math.max(currentTextWidth, radius*2);
            	
	            svg.append("circle")
	                .attr('class', 'moxiechart_growth_dotLegend')
	                .attr("cx", drawingPosition + ((currentLegendPortionWidth/2)))
	                .attr("cy", height + legendHeightPadding + maxRadiusSpace - radius)
	                .attr("r", radius);
	            
	            // X position will be the current draw position (text takes up all the room) or the dot is bigger, so we draw at the draw position with 
	            // a small gap to move the text over
	            var textXPosition = currentTextWidth < currentLegendPortionWidth ? ( drawingPosition + (currentLegendPortionWidth - currentTextWidth) / 2 ) : drawingPosition;
	            textXPosition++; // Text seems to look better moved over one. I have no other reason for this
	            
	            svg.append("text")
	                .attr('class', 'moxiechart_growth_textLegend')
	                .attr('x', textXPosition)
	                .attr('y', height + legendHeightPadding + textHeightPadding)
	                .text(data.booklabels[i].label)
	                .style('font-size', legendFontSize + "px")
	                .style("font-weight", fontWeight);
	            
	            // preps the drawing position for our next text/bubble combination
	            drawingPosition += (currentLegendPortionWidth + standardLegendSpacing);
            }

            // Bottom line across the legend
            var legendBottomLineSidePadding = 40 * modifier;
            var legendBottomLinePadding = 10 * modifier;
            svg.append("line")
                .attr('class', 'moxiechart_growth_bottomlineLegend')
                .attr("x1", 0 + legendBottomLineSidePadding)
                .attr("y1", height + legendHeightPadding + textHeightPadding + legendBottomLinePadding)
                .attr("x2", width - legendBottomLineSidePadding)
                .attr("y2", height + legendHeightPadding + textHeightPadding + legendBottomLinePadding);


            function translateCategoryIntoNumber(value) {
                return yAxisValues.indexOf(value);
            }

            // function for the x grid lines
            function make_x_axis() {
                return d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .ticks(xAxisValues.length);
            }

            // function for the y grid lines
            function make_y_axis() {
                return d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .ticks(yAxisValues.length);
            }

            function getBubbleSize(bubbleMultiplier, pages, bookLabels) {
            	
            	var pagesMultiplier = 0;
            	if(pages <= bookLabels[0].max) {
            		pagesMultiplier = 50;
            	} else if(pages > bookLabels[1].min && pages <= bookLabels[1].max){
            		pagesMultiplier = 150;
            	} else if(pages > bookLabels[2].min && pages <= bookLabels[2].max) {
            		pagesMultiplier = 250;
            	} else if(pages > bookLabels[3].min && pages <= bookLabels[3].max){
            		pagesMultiplier = 350;
            	} else {
            		pagesMultiplier = 450;
            	}
            	
            	
                return bubbleMultiplier * Math.sqrt(pagesMultiplier / Math.PI);
            }
        }
        
        var errorCallback = function(){
        	moxiechart.createChartError(divSelector, width);
        }
        
        // Make the call to get the data and then generate the chart
        this.get({
			jsonURL: jsonURL,
			auth: options.auth,
			callback: chartCallback,
			errorCallback: errorCallback
        });
    },

    createBookProgressChart: function(chartHeight, chartWidth, divSelector, jsonURL, auth, options) {

        var modifier = chartWidth / 200;
        var heightModifier = chartHeight / 110;

        var margin = {
            top: 5 * heightModifier,
            right: 5 * modifier,
            bottom: 5 * heightModifier,
            left: 5 * modifier
        };

        var outerHeight;
        var width;
        var height;

        var chartCallback = function(data) {

            // default progress books to 0
            if(!data.progress_books) data.progress_books = 0;
            
            if(!data || !data.progress_target_books || !data.progressbar || !data.progress_basepoints){
                if(window.console) console.log("Error in Book Progress Chart: " + JSON.stringify(data));
                moxiechart.createChartError(divSelector, chartWidth);
                return;
            }
            
            var startingPosition = 0;
            var rectangleHeight = 80 * heightModifier;
            var rectangleWidth = rectangleHeight /3;

            var numberOfBooks = Math.max(data.progress_books, data.progress_target_books);
            
            var modifiers = [];
            // Check and see if any points affect the width of the books
            var bookCount = 0;
            for(var i=0; i<numberOfBooks; i++){
                
                if(data.progressbar.length > i){
                    
                    var modifier = 1;
                    if(data.progressbar[i] > data.progress_basepoints){
                        modifier = 1.5;
                    } else if(data.progressbar[i] < data.progress_basepoints){
                        modifier = 0.5;
                    }
                    
                    bookCount += modifier;
                    modifiers.push(modifier);
                } else {
                    bookCount++;
                }
                
            }
            
            // Do a check to see if we need to make the books smaller in width
            var rectangleWidthWithData = (chartWidth - (margin.left + margin.right)) / bookCount;
            if(rectangleWidthWithData < rectangleWidth) rectangleWidth = rectangleWidthWithData;

            width = chartWidth - margin.left - margin.right;
            height = chartHeight - margin.top - margin.bottom;

            // Create the svg
            var svg = d3.select(divSelector)
                .append("svg")
                .attr("width", chartWidth)
                .attr("height", chartHeight)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // background colour
            svg.append("rect")
                .attr("width", chartWidth)
                .attr("height", chartHeight)
                .attr("fill", "#F6F6F6")
                .attr("transform", "translate(-" + margin.left + ", -" + margin.top + ")");

            for (var i = 1; i <= numberOfBooks; i++) {
            	
            	// Works out what colour to make the book when it is drawn
            	var bookFill = 'moxiecharts_progress_bookFillGrey';
            	if(i <= data.progress_books && i <= data.progress_target_books){
            		// the books that we have actually read which are under target
            		// True if current book number is less than progress books and less than target books
            		bookFill = 'moxiecharts_progress_bookFill';
            	} else if(i > data.progress_target_books && data.progress_books > data.progress_target_books){
            		// the boks that we have read which are over target
            		// True if current book number is greater than the target books and progress books is greater
            		// than target books
            		bookFill = 'moxiecharts_progress_bookFillOver';
            	} 
            	
            	var newRectangleWidth = rectangleWidth;
            	if(modifiers.length > i-1) newRectangleWidth = rectangleWidth * modifiers[i-1];
            	
                drawBook(svg, startingPosition, rectangleHeight, newRectangleWidth, bookFill);
                startingPosition += newRectangleWidth;
            }
        }
        
        function drawBook(svg, startingPosition, rectangleHeight, rectangleWidth, bookFill) {

            // calculate the variable height we will use
            rectangleHeight += (Math.random() * 20) * heightModifier;

            // Create the partially filled book
            svg.append("rect")
                .attr("x", startingPosition)
                .attr("y", height - rectangleHeight)
                .attr("height", rectangleHeight)
                .attr("width", rectangleWidth)
                .attr("class", bookFill);

            // Book outline
            svg.append("rect")
                .attr("x", startingPosition)
                .attr("y", height - rectangleHeight)
                .attr("height", rectangleHeight)
                .attr("width", rectangleWidth)
                .attr("class", "moxiecharts_progress_bookOutline");

            var gapBothSide = rectangleWidth * 0.5 /2;

            // bottom book line
            svg.append("line")
                .attr("x1", startingPosition + gapBothSide)
                .attr("y1", height - 20 * heightModifier)
                .attr("x2", startingPosition - gapBothSide + rectangleWidth)
                .attr("y2", height - 20 * heightModifier)
                .attr("class", "moxiecharts_progress_bookLine");

            // second book line
            var randomNum = Math.random();
            if (randomNum < .50) {
                svg.append("line")
                    .attr("x1", startingPosition + gapBothSide)
                    .attr("y1", height - 30 * heightModifier)
                    .attr("x2", startingPosition - gapBothSide + rectangleWidth)
                    .attr("y2", height - 30 * heightModifier)
                    .attr("class", "moxiecharts_progress_bookLine");
            }

            // top book line
            svg.append("line")
                .attr("x1", startingPosition + gapBothSide)
                .attr("y1", height - rectangleHeight + 20 * heightModifier)
                .attr("x2", startingPosition - gapBothSide + rectangleWidth)
                .attr("y2", height - rectangleHeight + 20 * heightModifier)
                .attr("class", "moxiecharts_progress_bookLine");
        }
        
        var errorCallback = function(){
        	moxiechart.createChartError(divSelector, chartWidth);
        }
        
        // Make the call to get the data and then generate the chart
        this.get({
			jsonURL: jsonURL,
			auth: auth,
			callback: chartCallback,
			errorCallback: errorCallback
        });
    },

    createProgressLastWeekChart: function(requestedWidth, divSelector, jsonURL, options) {

    	// Give priority to the parameter of width
    	if(options.width) requestedWidth = options.width;
	
    	d3.select(divSelector).style('width', requestedWidth + "px");

        var modifier = requestedWidth / 1200;

        var fontWeight = 'normal';
        if (modifier < 1) {
            fontWeight = 'bold';
        }
        
        var hasTotals = !options || !options.hideTotals || options.hideTotals == 'false';

        var topHtml = '<div style="display:flex; flex-direction: row;">' +
            '   <div class="moxiechart_lastweek_topHeading" style="flex: 2 0 0; margin-left: ' + 20 * modifier + 'px; ;">Group Weekly Progress</div>';

        // This is the heading and teh countdown - the top part of the chart
       d3.select(divSelector).append("div")
        	.attr('class', 'moxiechart_lastweek_topHeading')
        	.style('flex', '2 0 0')
            .style('margin-left', (20 * modifier) + 'px')
            .style('font-weight', 'bold')
            .html(topHtml);

        // modify the css rules
        d3.selectAll('.moxiechart_lastweek_topHeading')
        	.style('font-size', 35 * modifier + 'px')
            .style('margin-top', 26 * modifier + 'px')
            .style('margin-bottom', 20 * modifier + 'px');

        // BAR CHART
        var transitionChoices = ["sin", "quad", "cubic", "bounce", "exp", "circle", "elastic", "linear"];
        
        var chartIntialised = false;
        var currentSelectedBar;
        
        var chartCallback = function(data) {

        	var margin = {
        			top: 40 * modifier,
        			left: 20 * modifier,
        			bottom: 60 * modifier
        	};
        	
        	var width = 600 * modifier;
        	if(!hasTotals){
        		width = 1000 * modifier;
        		margin.top = 0;
        	}
        	
        	
            var groupSpacing = 10*modifier;
            var barSpacing = 5*modifier;
            var barHeight = 30 * modifier; //(height - margin.bottom - margin.top - (groupSpacing * ((dataset.length / 2)-1)) - (barSpacing * dataset.length-1) ) / dataset.length;
        	
            var numberOfBars = data.data.length * 2;
        	var height = barHeight * numberOfBars + margin.bottom + margin.top + (groupSpacing * ((numberOfBars / 2)-1)) + (barSpacing * numberOfBars-1); //80 * data.data.length * modifier;

        	var chartSvg;

        	var y = d3.scale.ordinal()
        		.rangeRoundBands([height - margin.bottom, 0], .2, 0.5);

        	var x = d3.scale.linear()
        		.range([0, width]);
        	
        	if(!chartIntialised){
        		
        		// Generate the left side headings - selects, cheers, logins etc
        		var html = '<div style="display:flex; flex-direction: column; padding-left: ' + 15 * modifier + 'px; padding-right: ' + 15 * modifier + 'px;">';
        		html += '   <div class="moxiechart_lastweek_textSubheadingHeading" style="text-align: right;">&nbsp;</div>';
        		
        		for(var i=0; i<data.data.length; i++){
        			html += '   <div class="moxiechart_lastweek_textSubheading" style="text-align: right;">' + data.data[i].title + '</div>';
        		}

        		html +='</div>';

        		// Div that holds the bar chart
        		html += '<div class="moxiechart_lastweek_barChart"></div>';

        		// Generate the stats to the right of the chart
        		// Do this if we don't have a parameters object OR we are allowing totals (hide totals is false)
        		if(hasTotals){
	        		var statsLabels = ['Week', 'Cycle', 'Year'];
	        		for(var i=0; i<3; i++){
	        			html += ('<div style="display:flex; flex-direction: column; padding-left: ' + 15 * modifier + 'px; padding-right: ' + 15 * modifier + 'px;">'
	        					+ '   <div class="moxiechart_lastweek_textSubheadingHeading weekTitle" style="margin-bottom:0;">' + statsLabels[i] + '</div>');
	
	        			for(var j=0; j<data.data.length; j++){
	        				html += '   <div class="' + statsLabels[i] + 'Value' + j + ' moxiechart_lastweek_numberSubheading"></div>';
	        			}
	
	        			html += '</div>';
	        		}
        		}

        		d3.select(divSelector).append("div")
	        		.style('display', 'flex')
	        		.style('flex-direction', 'row')
	        		.html(html);

        		d3.selectAll('.moxiechart_lastweek_numberSubheading')
	        		.style('font-size', 32 * modifier + 'px')
	        		.style('font-weight',  fontWeight);

        		d3.selectAll('.moxiechart_lastweek_textSubheading')
	        		.style('font-size', 32 * modifier + 'px')
	        		.style('font-weight', fontWeight)
	        		.style('line-height', 40 * modifier + 'px');

        		d3.selectAll('.moxiechart_lastweek_textSubheadingHeading')
	        		.style('font-size', 32 * modifier + 'px')
	        		.style('line-height', 40 * modifier + 'px')
	        		.style('font-weight', fontWeight);
        	}

    		chartSvg = d3.select(".moxiechart_lastweek_barChart").append("svg")
                .attr("width", width)
                .attr("height", height)
                .style("margin-right", 20 * modifier + 'px')
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        	
            var date = moment(data.cycle.starting).format("MM/DD");
            var weekEnd = moment(data.cycle.starting).add(7, 'day').format("MM/DD/YYYY");

            var dataset = [];
            var legendDataset = [];
            
            var currentStartWeek = moment().startOf('week');
            var previousStartWeek = moment().startOf('week').subtract(1, 'week');
            
            legendDataset.push({
            	label: "Last Week (" + previousStartWeek.format("MMM Do") + " - " + moment().startOf('week').subtract(1, 'week').endOf('week').format("Do") + ")",
            	colour: '#81BE42'
            });
            legendDataset.push({
            	label: 'This Week (' + currentStartWeek.format("MMM Do") + " - Now" + ")",
            	colour: '#76A0EF'
            });

            // iterates through the dataset to generate labels, the value and the tooltip for the
            // given piece of data
            for (var i = 0; i < data.data.length; i++) {
            	var dataObj = data.data[i];

            	var value;
            	if(dataObj.last_week.total == 0 && dataObj.last_week.value == 0){
            		value = 0;
            	} else {
            		value = dataObj.last_week.total == 0 ? 1 : (dataObj.last_week.value / dataObj.last_week.total);
            	}
            	if(value > 1) value = 1;
            		
            	var obj = {
            			label: dataObj.title + "last",
            			value: value * width,
            			tooltipValue: dataObj.last_week.value + " out of " + dataObj.last_week.total,
            			colour: '#81BE42',
            			title: dataObj.title,
            			series: "Last Week"
            	};

            	dataset.push(obj);

            	value;
            	if(dataObj.current_week.total == 0 && dataObj.current_week.value == 0){
            		value = 0;
            	} else {
            		value = dataObj.current_week.total == 0 ? 1 : (dataObj.current_week.value /  dataObj.current_week.total);
            	}
            	if(value > 1) value = 1;
            	
            	obj = {
            			label: dataObj.title + "current",
            			value: value * width,
            			tooltipValue: dataObj.current_week.value + " out of " + dataObj.current_week.total,
            			colour: '#76A0EF',
            			title: dataObj.title,
            			series: "This Week"
            	};

            	dataset.push(obj);
            	d3.selectAll('div.WeekValue' + i).html(dataObj.current_week.value.toLocaleString());
            	d3.selectAll('div.CycleValue' + i).html(dataObj.current_cycle.value.toLocaleString());
            	d3.selectAll('div.YearValue' + i).html(dataObj.current_year.value.toLocaleString());
            }

            y.domain(dataset.map(function(d) {
                return d.label;
            }));
            x.domain([0, width]);

            var bar = chartSvg
            	.selectAll(".moxiechart_lastweek_bar")
                .data(dataset);
            
            if(!chartIntialised){
            	// new data:
	            bar.enter().append("rect")
	                .attr("class", "moxiechart_lastweek_bar")
	                .attr({
	                	'x': 0,
		                'width': 0,
		                'height': barHeight,
		                'fill': function(d){
		                	return d.colour;
		                },
		                "transform": function(d, i) {
		                	return "translate(0," + (i * barHeight + groupSpacing * (0.5 + Math.floor(i/2)) + barSpacing * i) + ")";
					    }
	                });
            }

            var transitionToUse = Math.floor(Math.random() * 7);

            // updated data:
            bar.transition()
                .duration(1500)
                .ease(transitionChoices[transitionToUse])
                .attr("width", function(d) {
                    return x(d.value);
                });
            
            
            // Tooltips for the bubbles
            var tip = d3.tip()
                .attr('class', 'moxiechart_growth_d3-tip')
                .html(function(d) {
                    var tooltip = "<span class='moxiechart_growth_d3-tip_title'>" + d.title + "</span>" 
                        + "<br /><span class='moxiechart_growth_d3-tip_text'>" + d.series + "</span>"
                        + "<br /><span class='moxiechart_growth_d3-tip_text'>" + d.tooltipValue + "</span>";
                    
                    return tooltip;
                });
            
            
            // Sets the root element to be the div
            tip.rootElement(document.getElementsByClassName(divSelector.substring(1))[0]);

            // Does a call to create the tooltips
            chartSvg.call(tip);
            
            if(!chartIntialised){
            	
	            chartSvg.on('click', function() {
		    		if(currentSelectedBar){
		    			// When clicking elsewhere on the chart, hide the tooltip
		    			tip.hide(currentSelectedBar.d);
		            	currentSelectedBar = undefined;
		    		}
		    	});
            	
                bar.on('click', function(d) {
                	d3.event.stopPropagation();
                	
                	// If there is a previously shown tooltip, hide it
                	if(currentSelectedBar){
            			tip.hide(currentSelectedBar.d);
            			
            			var sameBar = currentSelectedBar.target == d3.event.target;
            			currentSelectedBar = undefined;
            			
            			if(sameBar) return;
                	}
                	
                	currentSelectedBar = {
                		d: d,
                		target: d3.event.target
                	};
                	
                	var scrollOffset = moxiechart._getScrollOffset(divSelector);
            
                    tip.show(d, scrollOffset);
                    
		            d3.selectAll('.moxiechart_growth_d3-tip_text')
		            	.style('font-size', '14px');
		            d3.selectAll('.moxiechart_growth_d3-tip_title')
		            	.style('font-size', '18px');
                });
            	
	            var lineHeight = barHeight * 2 + groupSpacing + barSpacing * 2;
	            d3.selectAll('.moxiechart_lastweek_textSubheading')
	                .style('line-height', lineHeight + "px");
	
	            d3.selectAll('.moxiechart_lastweek_numberSubheading')
	                .style('line-height', lineHeight + "px");
	            
	            
	            // Draw legend
				var legendRectSize = 20 * modifier;
				var legendPadding = 15 * modifier;
				var betweenPadding = 20 * modifier;
				
				// get the length of the labels on the chart
				var results = moxiechart._getLabelWidths(legendDataset, 'moxiechart_lastweek_legend', chartSvg, 20 * modifier);
				var labelWidths = results.labelWidths;
				var textHeight = results.textHeight;
				
				var legendWidth = 0;
				for(var i=0; i<labelWidths.length; i++){
					legendWidth += (labelWidths[i] + legendRectSize + legendPadding + betweenPadding);
				}

				// Start to draw the legend half way across the width of the chart - minux the text width
				var startDrawingPosition = (width - legendWidth) /2;
				
				var legend = chartSvg.selectAll('.moxiechart_lastweek_legend')
				    .data(legendDataset)
				    .enter()
				    .append('g')
				    .attr('transform', function (d, i) {
				    	
				    	var legendPosition = 0;
				    	if(i != 0){
				    		var previousLabelWidth = labelWidths[i-1];
				    		legendPosition = previousLabelWidth + legendRectSize + legendPadding + betweenPadding;
				    	}
				    					    					    	
				        return 'translate(' + (i * legendPosition + startDrawingPosition) + ',' + ((height - margin.top) - (margin.bottom/2)) + ')';
				    });
				
				legend.append('rect')
				    .attr('width', legendRectSize)
				    .attr('height', legendRectSize)
				    .style('fill', function (d, i) { return d.colour; } )
				    .style('stroke',  function (d, i) { return d.colour; } );
				
				legend.append('text')
				    .attr('class', 'moxiechart_lastweek_legend')
				    .attr('x', legendRectSize + legendPadding)
				    .attr('y', legendPadding)
				    .text(function (d) { return d.label; });
				
				d3.selectAll('.moxiechart_lastweek_legend')
					.style('font-size', (20 * modifier) + "px");
            }
            
            chartIntialised = true;
        }
        
        var errorCallback = function(){
        	moxiechart.createChartError(divSelector, requestedWidth);
        }
        
        if(options.refreshTime != undefined){
	    	
        	var myself = this;
	    	// Refresh the information ever refreshTime seconds
	        var timerId = setInterval(function(){
		
	        	var callback = function(data){
	        		
	        		// Uncomment this for testing of the bar moving!
	        		/*data.data[0].current_week.value += Math.floor(Math.random() * 15);
	        		data.data[0].current_week.total += 20;*/
	        		
	        		chartCallback(data);
	        	};
	        	
	        	
		        // Make the call to get the data and then generate the chart
		        myself.get({
					jsonURL: jsonURL,
					auth: options.auth,
					callback: callback,
					errorCallback: errorCallback
		        });
	        	
	        }, options.refreshTime * 1000);
	        
	        // After an hour, stop the interval timer if we are still on this page
	        setTimeout(function(){
	        	clearInterval(timerId);
	        }, 3600000);
	    }
        
        // Make the call to get the data and then generate the chart
        this.get({
			jsonURL: jsonURL,
			auth: options.auth,
			callback: chartCallback,
			errorCallback: errorCallback
        });
    },

    createReadingWeekTeams: function(requestedWidth, divSelector, jsonURL, auth, options) {

    	// Give priority to the parameter of width
    	if(options.width) requestedWidth = options.width;
    	
        d3.select(divSelector).style('width', requestedWidth + "px");

        var modifier = requestedWidth / 1200;
        var fontWeight = 'normal';
        if (modifier < 1) {
            fontWeight = 'bold';
        }

        d3.select(divSelector).append("div")
        	.attr('class', 'moxiechart_readingteams_topHeading')
            .style('margin-left', (20 * modifier) + 'px')
            .style('font-weight', 'bold')
            .html('Reading Challenge Group Progress');

        d3.select(divSelector).append("div")
        	.style('display', 'flex')
        	.style('flex-direction', 'row')
        	.style('justify-content', 'center')
        	.html(
	            '<div class="moxiechart_readingteams_leftColumn" style="display:flex; flex-direction: column; padding-left: ' + 15 * modifier + 'px; padding-right: ' + 15 * modifier + 'px;">' +
	            '   <div class="moxiechart_readingteams_textSubheadingHeading"  style="margin-bottom:0;">Go Teams!</div>' +
	            '</div>' +
	            '<div class="moxiechart_readingteams_barChart"></div>' +
	            '<div class="moxiechart_readingteams_rightColumn" style="display:flex; flex-direction: column; padding-left: ' + 15 * modifier + 'px; padding-right: ' + 15 * modifier + 'px;">' +
	            '   <div class="moxiechart_readingteams_textSubheadingHeading"  style="margin-bottom:0;">Moxie Points</div>' +
	            '</div>'
        	);

        // modify the css rules
        d3.selectAll('.moxiechart_readingteams_topHeading')
        	.style('font-size', 35 * modifier + 'px')
        	.style('margin-top', 26 * modifier + 'px')
        	.style('margin-bottom', 20 * modifier + 'px');

        // BAR CHART
        var chartCallback = function(data) {

            var dataset = [];
            var maxBarSize = 700 * modifier;

            for (var i = 0; i < data.data.length; i++) {
                var dataObj = data.data[i];

                var obj = {
                    label: dataObj.title,
                    value: dataObj.value / dataObj.total * maxBarSize,
                    tooltip: dataObj.title + "<br />" + dataObj.value + " out of " + dataObj.total
                };

                d3.select('.moxiechart_readingteams_leftColumn')
                    .style('max-width', 280 * modifier + 'px')
                    .append("div")
                    .html(dataObj.title.toUpperCase())
                    .attr('class', "moxiechart_readingteams_textSubheading");

                d3.select('.moxiechart_readingteams_rightColumn')
                    .style('max-width', 210 * modifier + 'px')
                    .append('div')
                    .attr('class', "moxiechart_readingteams_numberSubheading")
                    .html(dataObj.value.toLocaleString());

                dataset.push(obj);
            }

            d3.selectAll('.moxiechart_readingteams_numberSubheading')
            	.style('font-size', 32 * modifier + 'px')
            	.style('margin-top', 10 * modifier + 'px')
            	.style('margin-bottom', 10 * modifier + 'px')
            	.style('font-weight', fontWeight);

            d3.selectAll('.moxiechart_readingteams_textSubheading')
            	.style('font-size', 32 * modifier + 'px')
            	.style('margin-top', 10 * modifier + 'px')
            	.style('margin-bottom', 10 * modifier + 'px')
            	.style('font-weight', fontWeight);

            d3.selectAll('.moxiechart_readingteams_textSubheadingHeading')
            	.style('font-size', 30 * modifier + 'px')
            	.style('line-height', 56 * modifier + 'px')
            	.style('font-weight', fontWeight);

            var margin = {
                top: 20 * modifier,
                left: 20 * modifier
            };
            var width = 700 * modifier;
            var height = 450 * modifier;

            var div = d3.select(divSelector).append("div").attr("class", "moxiechart_readingteams_toolTip");

            var y = d3.scale.ordinal()
                .rangeRoundBands([height, 0], .2, 0.5);

            var x = d3.scale.linear()
                .range([0, maxBarSize]);


            var svg = d3.select(".moxiechart_readingteams_barChart").append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            d3.selectAll('.moxiechart_readingteams_barChart')
            	.style('min-width', width)
            	.style('max-width', width);

            var barGradient = svg.append("defs")
                .append("linearGradient")
                .attr("id", "moxiechart_readingteams_barGradient")
                .attr("x1", "0%").attr("y1", "0%")
                .attr("x2", "100%").attr("y2", "0%")
                .selectAll("stop")
                .data([{
                    offset: "0%",
                    color: "#F98A42"
                }, {
                    offset: "50%",
                    color: "#81BE42"
                }, {
                    offset: "100%",
                    color: "#76A0EF"
                }])
                .enter().append("stop")
                .attr("offset", function(d) {
                    return d.offset;
                })
                .attr("stop-color", function(d) {
                    return d.color;
                });

            var transitionChoices = ["sin", "quad", "cubic", "bounce", "exp", "circle", "elastic", "linear"];


            change(dataset);

            function change(dataset) {

                dataset.reverse();

                y.domain(dataset.map(function(d) {
                    return d.label;
                }));
                x.domain([0, maxBarSize]);

                var bar = svg.selectAll(".moxiechart_readingteams_bar")
                    .data(dataset);

                // new data:
                var barHeight;
                bar.enter().append("rect")
                    .attr("class", "moxiechart_readingteams_bar")
                    .attr("x", 0)
                    .attr("y", function(d) {
                        return y(d.label);
                    })
                    .attr("width", function(d) {
                        return width - x(d.value);
                    })
                    .attr("height", y.rangeBand())
                    .style("fill", "url(#moxiechart_readingteams_barGradient)")
                    .each(function(d, i) {
                        //  var thisWidth = this.getComputedTextLength()
                        var bbox = this.getBBox();
                        barHeight = bbox.height;
                    });

                // removed data:
                bar.exit().remove();

                var transitionToUse = Math.floor(Math.random() * 7);

                // updated data:
                bar.transition()
                    .duration(1500)
                    .ease(transitionChoices[transitionToUse])
                    .attr("x", 0)
                    .attr("y", function(d) {
                        return y(d.label);
                    })
                    .attr("width", function(d) {
                        return x(d.value);
                    })
                    .attr("height", y.rangeBand());


                bar.on("mousemove", function(d) {
                    div.style("left", d3.event.pageX + 10 + "px");
                    div.style("top", d3.event.pageY - 25 + "px");
                    div.style("display", "block");
                    div.style("position", "fixed");
                    div.html((d.tooltip));
                });
                bar.on("mouseout", function(d) {
                    div.style("display", "none");
                });

                d3.selectAll('.moxiechart_readingteams_textSubheading')
                    .style('line-height', barHeight + "px");

                d3.selectAll('.moxiechart_readingteams_numberSubheading')
                    .style('line-height', barHeight + "px");
            };
        }
        
        var errorCallback = function(){
        	moxiechart.createChartError(divSelector, requestedWidth);
        }
        
        // Make the call to get the data and then generate the chart
        this.get({
			jsonURL: jsonURL,
			auth: auth,
			callback: chartCallback,
			errorCallback: errorCallback
        });

    },
    
    /*
     * Creates a chart from paramaters in the url 
     * 
     * locationUrl - A url eg. http://url.com?parameter=value&parameter2=value2
     * divSelector - the class name of the div you want the chart to draw into
     * chartWidth - The width of the chart (required)
     * chartHeight - The height of the chart (required for bookprogress)
     *
     * url parameters:
     * chart_type - the type of chart we are going to generate. Current possible values are
     *    # gauge - Gauge diagram
     *    # progresslastweek - Group Weekly Progress
     *    # readingweekteams - Reading Challenge Group Progress
     *    # readinggrowth - Reading Growth
     *    # bookprogress - Book Progress Bar
     *    # moxiehunt - Moxie hunt
     *    # moxiecheckin - Student Check-in
     *    # readingcard - Reading Challenge Slider Card
     * class_id - The class id (required for Gauge, Progress Last Week, Reading Week Teams, Reading Growth, Book Progress, Moxie hunt)
     * student_id - The student id (required for Gauge, Reading Growth, Book Progress)
     * cycle_id - The cycle id (required for Gauge, Reading Growth, Book Progress)
     * access_token - The access token - required when chart accessed from different domain 
     * refresh_time - The refresh time for how often the chart is refreshed (optional for moxie hunt)
     */
    generateChartFromParametersURL: function(locationUrl, chartWidth, chartHeight, divSelector){
    	var query = URI.parse(locationUrl);
    	var parameters = URI.parseQuery(query.query);

    	moxiechart.generateChartFromParameters(parameters, chartWidth, chartHeight, divSelector);
    },
    
    generateChartFromParameters: function(parameters, chartWidth, chartHeight, divSelector){
    	
    	var jsonURL = '';
    	
    	if(parameters.base_url){
    		jsonURL = parameters.base_url;
    	}

    	if(parameters.chart_type === 'gauge'){
    		// Gauge Chart
    		jsonURL += "/class/" + parameters.class_id + "/cycle/" + parameters.cycle_id + "/student/" + parameters.student_id + "/stats/progress";
    		this.createGaugeChart(chartWidth, divSelector, jsonURL, parameters.access_token, {
    		    refreshOnly: parameters.refreshOnly
    		});
    	} else if(parameters.chart_type === 'moxiehunt'){
    		jsonURL += "/class/" + parameters.class_id + "/stats/progress/hunt";
    		this.createMoxieHuntChart(chartWidth, divSelector, jsonURL, {
    			auth: parameters.access_token,
    			refreshTime: parameters.refreshTime,
    			browserMode: parameters.browserMode,
    			width: parameters.width
    		});
    	} else if(parameters.chart_type === 'progresslastweek'){
    		// Progress Last Week
    		jsonURL += "/class/" + parameters.class_id + "/stats/progress/week";     		
    		this.createProgressLastWeekChart(chartWidth, divSelector, jsonURL, {
    			auth: parameters.access_token,
    			//refreshTime: parameters.refreshTime,
    			width: parameters.width,
    			hideTotals: parameters.hideTotals,
    			hideCounter: parameters.hideCounter
    		});
    	} else if(parameters.chart_type === 'readingweekteams') {
    		// Reading Week Teams
    		jsonURL += "/class/" + parameters.class_id + "/stats/progress/weekteam";
    		parameters.cycle_id ? (jsonURL += "?cycle_id=" + parameters.cycle_id) : "";
            
    		this.createReadingWeekTeams(chartWidth, divSelector, jsonURL, parameters.access_token, {
    			width: parameters.width
    		});
    	} else if(parameters.chart_type === 'readinggrowth'){
    		// Reading Growth
    		jsonURL += "/class/" + parameters.class_id + "/cycle/" + parameters.cycle_id + "/student/" + parameters.student_id + "/stats/growth";
    		this.createReadingGrowthChart(chartWidth, divSelector, jsonURL, {
    			auth: parameters.access_token,
    			width: parameters.width
    		});
    	} else if(parameters.chart_type === 'bookprogress'){
    		// Book Progress Bar
    		jsonURL += "/class/" + parameters.class_id + "/cycle/" + parameters.cycle_id + "/student/" + parameters.student_id + "/stats/progress";
    		this.createBookProgressChart(chartHeight, chartWidth, divSelector, jsonURL, parameters.access_token);
    	} else if(parameters.chart_type === 'moxiecheckin'){
    		jsonURL += "/class/" + parameters.class_id + "/stats/progress/hunt?weekly=true";
    		this.createMoxieCheckinChart(chartWidth, divSelector, jsonURL, {
    			auth: parameters.access_token,
    			refreshTime: parameters.refreshTime,
    			browserMode: parameters.browserMode,
    			width: parameters.width
    		});
    	} else if(parameters.chart_type == 'readingcard'){
    	    // Reading Challenge Slider Card
            jsonURL += "/class/" + parameters.class_id + "/cycle/" + parameters.cycle_id;
            this.createReadingChallengeCard(chartWidth, divSelector, jsonURL, {
                auth: parameters.access_token
            });
    	} else if(parameters.chart_type == 'genre'){
    	    
    	    jsonURL += "/class/" + parameters.class_id + "/student/" + parameters.student_id + "/genres/count";
    	    
    	    this.createGenrePiechart(chartWidth, divSelector, jsonURL, {
    	        auth: parameters.access_token,
                width: parameters.width,
                showSuperGenre: parameters.showSuperGenre // true or false
    	    });
    	}
    },
    
    createChartError: function(divSelector, width){

    	d3.select(divSelector).html("").append("div")
    		.attr('class', 'moxiechart_error_message')
        	.style('width', width + "px")
            .html("Oh no! There was an error generating the chart");
    },
    
    createMoxieHuntChart: function(requestedWidth, divSelector, jsonURL, options) {
    	
    	if(!options) options = {};
    	options.title = "MoxieHunt";
    	
    	this._createGenericMoxieHuntChart(requestedWidth, divSelector, jsonURL, options);
    },
    
    createMoxieCheckinChart: function(requestedWidth, divSelector, jsonURL, options) {
    	
    	if(!options) options = {};
    	options.title = "Student Check-in";
    	options.showCounter = true;
    	
    	this._createGenericMoxieHuntChart(requestedWidth, divSelector, jsonURL, options);
    },
    
    _createGenericMoxieHuntChart: function(requestedWidth, divSelector, jsonURL, options) {
    	
    	var hasCounter = options && (options.showCounter || options.showCounter == 'true');
    	
    	// Give priority to the parameter of width
    	if(options.width) requestedWidth = options.width;
    	    	
    	if(!options.browserMode || options.browserMode == 'false'){
    		d3.select(divSelector).style('width', requestedWidth + "px");
    	}
    	
        var modifier = requestedWidth / 1024;
        var fontWeight = 'normal';
        if (modifier < 1) {
            fontWeight = 'bold';
        }
        
        var headerHeight = 90;
                
        // If we want to show the counter
        if(hasCounter){
	        d3.select(divSelector).append("div")
	        	.attr('class', 'moxiechart_hunt_timer')
	            .style('font-size', (16 * modifier) + 'px')
	            .html('   <div style="flex: 1 0 0;">' +
            '      <div style="display:flex; flex-direction: row;">' +
            '         <div class="moxiechart_lastweek_clockdiv">' +
            '            <div>' +
            '               <span class="minutes" style="padding: ' + 15 * modifier + 'px; border-radius: 3px"></span>' +
            '            </div>' +
            '            <div>' +
            '               <span class="seconds" style="padding: ' + 15 * modifier + 'px; border-radius: 3px"></span>' +
            '            </div>' +
            '         </div>' +
            '      </div>' +
            '   </div>' +
            '</div>');
        }
        
        // Upper right title
        d3.select(divSelector).append("div")
        	.classed('moxiechart_hunt_topheading', true)
            .style('margin-right', (20 * modifier) + 'px')
            .style('margin-top', (30 * modifier) + 'px')
            .style('font-weight', 'bold')
            .style('font-size', (48 * modifier) + 'px')
            .html(options.title);
        
        // Moxie hunt instructions, appears on the left hand side
        d3.select(divSelector).append("div")
        	.attr('class', 'moxiechart_hunt_instructions')
        	.style('margin-left', (20 * modifier) + 'px')
        	.style('margin-top', (40 * modifier) + 'px')
            .style('font-weight', fontWeight)
            .style('font-size', (16 * modifier) + 'px');

		// This is our help div - create it now so we don't keep 
        // appending it if help is shown over and over again
        d3.select(divSelector)
        	.append('div')
        	.classed('moxiechart_hunt_info', true)
        	.style('padding', (25 * modifier) + 'px')
        	.style('font-size', (25 * modifier) + 'px')
        	.on('click', function() {
        		d3.select('.moxiechart_hunt_info').style('display', 'none');
        	});
    
		// upper right hand info icon
        d3.select(divSelector).append("div")
        	.classed('moxiechart_hunt_info_icon', true)
        	.style('height', (25 * modifier) + 'px')
        	.style('width', (25 * modifier) + 'px')
        	.style('left', (25 * modifier) + 'px')
        	.style('background-size', (25 * modifier) + 'px ' + (25 * modifier) + 'px')
        	.style('display', 'none')
        	.on('click', function() {
        		d3.select('.moxiechart_hunt_info').style('display', 'block');
        	});

        if(options.browserMode){
        	d3.select('.moxiechart_hunt_info_icon')
        		.style('float', 'none')
        		.style('left', (25 * modifier) + 'px');
        
	        // position the heading if this is browser mode, so it isn't
	        // stuck all the way over to the right of the page
        	d3.select('.moxiechart_hunt_topheading')
        		.style('float', 'none')
        		.style('position', 'absolute')
        		.style('left', (600 * modifier) + 'px');
        }
        
        d3.select(divSelector).append("div")
        	.attr('class', 'moxiechart_hunt_information')
        	.style('padding-top', (headerHeight * modifier) + 'px');

        // TIMER
        function getTimeRemaining(endtime) {

            var t = Date.parse(endtime) - Date.parse(new Date());
            var seconds = Math.floor((t / 1000) % 60);
            var minutes = Math.floor((t / 1000 / 60) % 60);
            return {
                'total': t,
                'minutes': minutes,
                'seconds': seconds
            };
        }

        function initialiseClock(endtime) {

            function updateClock() {
                var t = getTimeRemaining(endtime);
                d3.selectAll('.minutes').html(('0' + t.minutes).slice(-2));
                d3.selectAll('.seconds').html(('0' + t.seconds).slice(-2));

                if (t.total <= 0) {
                    clearInterval(timeinterval);
                }
            }

            updateClock();
            var timeinterval = setInterval(updateClock, 1000);
        }
        
        var cssAnimationList = ['hinge', 'swing', 'slideInUp', 'slideInDown', 'slideInLeft', 'lightSpeedIn', 'rotateIn', 'rollIn', 'rotateInUpLeft', 'flip', 'slideInRight',
                                'rotateInDownLeft', 'rotateInDownRight', 'rotateInUpLeft', 'rotateInUpRight', 'flipInX', 'flipInY', 'fadeInLeftBig', 'fadeInDownBig',
                                'fadeInRightBig', 'fadeInUpBig'];
        var cssAvatarAnimationList = ['flip', 'bounce', 'flash', 'shake', 'rubberBand', 'swing','tada', 'wobble', 'jello'];
        
        var myself = this;
        
        // These are used to hold state on the changing information. Keeps track of students and if they have made a change between each refresh
        // as well as if the group is completed and if they are currently in a bounce cycle (completed means bouncing for three iterations)
        var studentInformation = {};
        var groupInformation = {};
        
        var chartInitalised = false;
	    function drawHuntInformation(){

	    	for(var i=0; i<cssAnimationList.length; i++){
	    		d3.select('.moxiechart_hunt_topheading').classed(cssAnimationList[i], false);
	    	}
	    	d3.select('.moxiechart_hunt_topheading').classed('animated', false);
	    	d3.select('.moxiechart_hunt_topheading').classed('animated ' + cssAnimationList[Math.floor(Math.random() * cssAnimationList.length)], true);
	    	
	    	var chartCallback = function(data) {
	    	
	    		if(hasCounter && !chartInitalised){
					var deadline = new Date(Date.parse(new Date()) + data.data.timer * 1000);
					initialiseClock(deadline);
					chartInitalised = true;
				}
	    		
		        // Empty out the div before we start rendering again
		        d3.select('.moxiechart_hunt_information').html('');
	    		
		        d3.select('.moxiechart_hunt_instructions').html('');
	    		d3.select('.moxiechart_hunt_instructions').html(data.data.instructions);
	    		
	    		d3.select('.moxiechart_hunt_info').html('');
	    		
	    		// if there is no help text
	    		if(data.data.helptext.length == 0){
	    			d3.select('.moxiechart_hunt_info_icon')
	    				.style('display', 'none');	    			
	    		} else {
	    			d3.select('.moxiechart_hunt_info').html(data.data.helptext);
	    			d3.select('.moxiechart_hunt_info_icon')
	    				.style('display', 'block');
	    		}
	    		
		        var startingPosition = 0;
		        
		        // FOR TESTING UNCOMMENT THIS - BOUNCE TESTING - whole class
    			//data.data.group[0].hunt.value = data.data.group[0].hunt.total;

    			d3.select('.moxiechart_hunt_information')
		        	.selectAll('.moxiechart_hunt_class')
					.data(data.data.group).enter()
					.append('div')
						.attr('class', 'moxiechart_hunt_class')
						.html(function (d) { 
			            	
			            	var studentHtml = "<div class='moxiechart_hunt_students'>";
			            	
			            	var allStudentsFinished = d.hunt.value >= d.hunt.total;
			            	var currentGroup = groupInformation[d.id];
			            	if(!currentGroup){
			            		// If the current group hasn't been created yet, create it and set
			            		// finished to be the value of allStudentsFinished
			            		groupInformation[d.id] = {
			            			finished: allStudentsFinished,
			            			iterations: 3
			            		};
			            		currentGroup = groupInformation[d.id];
			            	} else if(!currentGroup.finished && allStudentsFinished){
			            		// otherwise if we haven't 'finished' for this group, and we just did
			            		// finish, then update the group finished information
			            		currentGroup.finished = allStudentsFinished;
			            	}
			            	
		            		for(var i=0; i<d.students.length; i++){
		            			
		            			var studentInfo = d.students[i];
		            			var studentPreviousHunt = studentInformation[studentInfo.id];
		            			
		            			// FOR TESTING UNCOMMENT THIS - BOUNCE TESTING - individual
		            			//if(studentPreviousHunt != undefined) studentPreviousHunt--;
		            			
		            			var percentage = Math.floor(studentInfo.hunt.value / studentInfo.hunt.total * 100);

		            			var baseUrl = options.base_url;
		            			if(!baseUrl){
		            				baseUrl = 'http://' + data.data.base.url;
		            			}
		            			
		            			var imageUrl = baseUrl + '/class/' + data.data.class.id + '/student/' + studentInfo.id + '/avatar';
		            			
		            			var imageClass = 'moxiechart_hunt_individualimage';
		            			if((studentPreviousHunt != undefined && percentage > studentPreviousHunt) 
		            					|| (currentGroup.finished && currentGroup.iterations > 0)){
		            				imageClass += ' animated ' + cssAvatarAnimationList[Math.floor(Math.random() * cssAvatarAnimationList.length)] + ' infinite';
		            			}
		            			
		        				studentHtml += ("<div class='moxiechart_hunt_individualrecord'>"
		        					+ "<img class='" + imageClass + "' src='" + imageUrl + "' />"
		        					+ "<div class='moxiechart_hunt_individualstudent'>" + studentInfo.title + "</div>"
		        					+ "<div class='moxiechart_hunt_individualpercentage' id='moxiechart_hunt_individualpercentage" + studentInfo.id + "'></div>"
		        					+ "</div>");
		        				
		        				studentInformation[studentInfo.id] = percentage;
		        			}
		            		studentHtml += "</div>";
		            		
		            		// if the current group is finished, then remove one of their iterations so that we
		            		// don't keep animating them over and over
		            		if(currentGroup.finished && currentGroup.iterations > 0){
		            			currentGroup.iterations--;
		            		}
			            	
							return "<div class='moxiechart_hunt_classtotal'>" 
			        			+ "   <div class='moxiechart_hunt_classtitle'>" + d.title + "</div>"
			        			+ "   <div class='moxiechart_hunt_barchart'></div>"
			        			+ "</div>"
			        			+ studentHtml; 
						})
						.each(function(d){
							// Each group has a bar chart associated with it. This draws it after figuring out the width of the bar
							var barFill = d.hunt.value / d.hunt.total;
							drawBar(this.firstChild.children[1], 15 * modifier, 230 * modifier, barFill, true);
		            	});
		        
		        // Draw bars for each student now
		        for(studentId in studentInformation){
		        	drawBar('#moxiechart_hunt_individualpercentage' + studentId, 10 * modifier, 100 * modifier, studentInformation[studentId]/100, false);
		        }
		        
		        
		        // Style changes based on the size of the chart
		        d3.selectAll('.moxiechart_hunt_classtotal')
		        	.style('font-size', (20 * modifier) + 'px')
		        	.style('font-weight', fontWeight);
		        d3.selectAll('.moxiechart_hunt_class')
		        	.style('padding', (6 * modifier) + 'px ' + (14 * modifier) + 'px');
		        d3.selectAll('.moxiechart_hunt_individualrecord')
		        	.style('font-size', (16 * modifier) + 'px')
		        	.style('padding', (10 * modifier) + 'px')
		        	.style('font-weight', fontWeight);
		        d3.selectAll('.moxiechart_hunt_individualimage')
		        	.style('height', (60 * modifier) + 'px');
		        d3.selectAll('.moxiechart_hunt_individualstudent')
		        	.style('margin-top', 6 * modifier + 'px');
		    };
		    
		    function drawBar(barDiv, barHeight, barWidth, barFill, groupBar) {
		
		    	// Create the svg
		        var svg = d3.select(barDiv)
		            .append("svg")
		            .attr("width", barWidth)
		            .attr("height", barHeight)
		            .append("g")
		            .attr("transform", "translate(0,0)");
		
                var classToUse = 'moxiecharts_hunt_barfill';
                if(groupBar){
                    classToUse = 'moxiecharts_hunt_barfill_big';
                }
                
                // Create the partially filled bar
                svg.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("height", barHeight)
                    .attr("width", barWidth * barFill)
                    .attr("class", classToUse);
		
		        if (barFill < 1) {
		            svg.append("rect")
		                .attr("x", barWidth * barFill - 0.5)
		                .attr("y", 0)
		                .attr("height", barHeight)
		                .attr("width", barWidth * (1 - barFill))
		                .attr("class", "moxiecharts_hunt_barbackground");
		        }
		
		    }
		
		    var errorCallback = function(){
		    	moxiechart.createChartError(divSelector, requestedWidth);
		    }
		    
		    // Make the call to get the data and then generate the chart
		    myself.get({
				jsonURL: jsonURL,
				auth: options.auth,
				callback: chartCallback,
				errorCallback: errorCallback
		    });
		    	
	    }
	    
	    function resizeHunt(){
	    	
	    }
        
	    if(options.refreshTime != undefined){
	    	
	    	// Refresh the information ever refreshTime seconds
	        var timerId = setInterval(function(){
	        	drawHuntInformation();
	        }, options.refreshTime * 1000);
	        
	        // After an hour, stop the interval timer if we are still on this page
	        setTimeout(function(){
	        	clearInterval(timerId);
	        }, 3600000);
	    }
        drawHuntInformation();
    },
    
            
    // Common helper functions
    
    _findAncestor: function(el, cls) {
	    while ((el = el.parentElement) && !el.classList.contains(cls));
	    return el;
	},
    
    _getComputedTranslateY: function(obj) {
	    if(!window.getComputedStyle) return;
	    var style = getComputedStyle(obj),
	        transform = style.transform || style.webkitTransform || style.mozTransform;
	    var mat = transform.match(/^matrix3d\((.+)\)$/);
	    if(mat) return parseFloat(mat[1].split(', ')[13]);
	    mat = transform.match(/^matrix\((.+)\)$/);
	    return mat ? parseFloat(mat[1].split(', ')[5]) : 0;
	},
	
	_getScrollOffset: function(divSelector){
		
		var offset = {
			left: 0,
			top: 0
		};
		
	    // THIS IS SOOOOOO BAD OMG
    	// This is to compensate for the app which is using transform to scroll the page, so we need to find the 
    	// 'Scroll' element if it exists, and if it does, find out how much we have scrolled (transformed) down 
    	// by a y value, so we can compensate for that with our absolutely positioned tooltips which are attached
    	// to the chart div
        var scrollElement = moxiechart._findAncestor(document.getElementsByClassName(divSelector.substring(1))[0], 'scroll');
        if(scrollElement){
        	offset.top = moxiechart._getComputedTranslateY(scrollElement);
        }
        
        // Gees, this is bad as well, so the templates we are using for the teacher dashboard scroll on a div, and the div
        // which does this scrolling is duplicated for some reason, so we need to go through all instances of the class
        // 'main_scroll_layout_div' (which I've added to main.jade) and check to see if any of them have any scrolling
        // Going to use jquery for this, because its used on the dashboard/console
        if (window.jQuery && $('div.main_scroll_layout_div').length > 0) {
        	var elements = $('div.main_scroll_layout_div');
        	
        	if(elements.length > 0){
        		
        		// Get the position from the top of the page - banner
        		offset.top = $($('.main_scroll_layout_div')[0]).offset().top;
        		offset.left = $($('.main_scroll_layout_div')[0]).offset().left;
        		
        		// Get the scroll of the element which has actually scrolled
	        	for(var i=0; i<elements.length; i++){
	        		var scrollTop = $(elements[i]).scrollTop();
	        		if(scrollTop && scrollTop > 0){
	        			offset.top -= scrollTop;
	        			break;
	        		}
	        	}
        	}
        	
        	offset.left += $(divSelector).offset().left;
        }
        
        return offset;
	},

	_getLabelWidths: function(data, className, svg, fontSize){
		
		// Go through all the strings in 'data' and work out the width of all of them. Use
		// the class name to set the correct css for the legend labels. Additionally keep track of
		// the maximum width as well as the text height and return all of this as an object
        var labelWidths = [];
        var maxWidth = 0;
        var textHeight = 0;
        
        var dummyLegendLabels = svg.append('g')
            .selectAll('.dummyLegendLabels')
            .data(data)
            .enter()
            .append("text")
            .attr("class", className);
        
        if(fontSize){
        	dummyLegendLabels.style('font-size', (fontSize + "px"));
        }
        
        dummyLegendLabels.text(function(d) {
            	
            	// Sometimes our arrays are just text strings, so we use d, otherwise
            	// its an object and the string is in d.label, so support both of these options
            	var label;
            	if(d.label){
            		// try d.label
            		label = d.label;
            	} else {
            		label = d;
            	}
            	
                return label;
            })
            .each(function(d, i) {
                var bbox = this.getBBox();
                var width = bbox.width;
                textHeight = bbox.height;
                if(width > maxWidth) maxWidth = width;
                
                labelWidths.push(width);
                this.remove(); // remove them just after displaying them
            });
        
        var result = {
        	labelWidths : labelWidths,
        	maxWidth: maxWidth,
        	textHeight: textHeight
        };
        
        return result;
	},
	
	createReadingChallengeCard : function(requestedWidth, divSelector, jsonURL, options) {
	    
        var modifier = requestedWidth / 600;

        var margin = {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
        };

        var width = 600 * modifier - margin.left - margin.right;
        var height = 300 * modifier;
	    
	    var initialChartCallback = function(dataset) {
	     
           var data = {
                books: dataset.cycle && dataset.cycle.books ? dataset.cycle.books.toLocaleString() : 0,
                pages: dataset.cycle && dataset.cycle.pages ? dataset.cycle.pages.toLocaleString() : 0,
                moxie: dataset.cycle && dataset.cycle.points ? dataset.cycle.points.toLocaleString() : 0,
                weeks: dataset.cycle.weeks,
                current_week: dataset.cycle.weeks - dataset.cycle.length.remaining.week,
                messages: new Array(dataset.cycle.weeks),
                challenge_name: dataset.cycle.title,
                starting: moment(dataset.cycle.starting).format("MM/DD"),
                ending: moment(dataset.cycle.starting).add(dataset.cycle.weeks, "weeks").format("MM/DD")
            };
           
           if(data.current_week == 0) data.current_week = 1;
	        
           data.messages[0] = dataset.cycle.weektext[0];
           data.messages[data.weeks-1] = dataset.cycle.weektext[2];
           for(var i=1; i<(data.weeks-1); i++){
               data.messages[i] = dataset.cycle.weektext[1];
           }
           
           var el = d3.select(divSelector);
	        
            // Create SVG element
            var svg = el.append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom);
                        
            // Reading Challenge name
            svg.append("text")
                .classed('moxiechart_card_challenge_title', true)
                .attr("font-size", (26 * modifier) + "px")
                .attr("x", margin.left + (20 * modifier))
                .attr("y", 44 * modifier)
                .text(data.challenge_name);
            
            // Draw the outline
            svg.append("rect")
                .classed("moxiechart_card_border", true)
                .attr("x", margin.left)
                .attr("y", margin.top)
                .attr("height", height)
                .attr("width", width)
                .attr("rx", 10)
                .attr("ry", 10);
	        
            // Draw the dividing line under the circles
            svg.append("line")
                 .classed('moxiechart_card_divider', true)
                 .attr("x1", margin.left)
                 .attr("y1", 240 * modifier)
                 .attr("x2", width + margin.right)
                 .attr("y2", 240 * modifier);
            
            var circleLeftPadding = 20 * modifier;
            var circleRightPadding = 20 * modifier;
            var circleRadius = 20 * modifier;
            var circleSelectedRadius = 32 * modifier;
            var circleSpacing = (width - circleLeftPadding - circleRightPadding - (circleRadius * 2 * (data.weeks-1))) / (data.weeks+1);
                        
            // Draw a line behind the circles
            svg.append("line")
                 .classed('moxiechart_card_divider', true)
                 .attr("x1", margin.left + circleSpacing + circleRadius)
                 .attr("y1", 180 * modifier)
                 .attr("x2", width - margin.right - circleSpacing - circleRadius)
                 .attr("y2", 180 * modifier);
            
            // Draw the circles
            var icons = ['\uf185', '\uf1cd', '\uf0f3', '\uf2dc', '\uf0c6', '\uf004', '\uf164', '\uf09c'];
            var dataset = [];
            for(var i=0; i<data.weeks; i++){
                var className = 'moxiechart_card_past_week';
                if(i+1 > data.current_week){
                    className = 'moxiechart_card_future_week';
                } else if(i+1 == data.current_week){
                    className = 'moxiechart_card_current_week';
                }

                var icon;
                if(i == 0){
                    icon = '\uf0e7';
                } else if(i+1 == data.weeks){
                    icon = '\uf140';
                } else if(i+1 == data.current_week){
                    icon = '\uf0c0';
                } else {
                    var position = Math.floor((Math.random() * 7) + 1);
                    icon = icons[position];
                }
                dataset.push({
                    week: i+1,
                    className: className,
                    icon: icon
                });
            }

            svg.append("circle")
                .attr("class", "moxiechart_card_selected_week")
                .attr("cx", function(d){
                      return circleSpacing * (data.current_week) + (circleRadius * 2) * (data.current_week-1) + circleLeftPadding + margin.left;
                })
                .attr("cy", 180 * modifier)
                .attr("r", circleSelectedRadius);
            
            svg.selectAll(".moxiechart_card_weeks")
                .data(dataset).enter()
                .append("circle")
                .attr("class", function(d){
                      return (d.className + " moxiechart_card_weeks");
                })
                .attr("cx", function(d){
                      return circleSpacing * (d.week) + (circleRadius * 2) * (d.week-1) + circleLeftPadding + margin.left;
                })
                .attr("cy", 180 * modifier)
                .attr("r", circleRadius)
                .on('click', function(d) {
                   svg.selectAll(".moxiechart_card_title_tag")
                       .text(data.messages[d.week-1]);
                   
                   svg.selectAll(".moxiechart_card_selected_week")
                       .attr('cx', circleSpacing * (d.week) + (circleRadius * 2) * (d.week-1) + circleLeftPadding + margin.left);
                });

            svg.selectAll(".moxiechart_card_weeks_characters")
                .data(dataset).enter()
                .append('text')
                .attr("class", 'moxiechart_card_weeks_characters')
                .attr("x", function(d){
                      return circleSpacing * (d.week) + (circleRadius * 2) * (d.week-1) + circleLeftPadding + margin.left;
                })
                .attr("y", 182 * modifier)
                .attr('font-size', (26 * modifier) + 'px')
                .text(function(d){
                    return d.icon;
                })
                .on('click', function(d) {
                   svg.selectAll(".moxiechart_card_title_tag")
                       .text(data.messages[d.week-1]);
                   
                   svg.selectAll(".moxiechart_card_selected_week")
                       .attr('cx', circleSpacing * (d.week) + (circleRadius * 2) * (d.week-1) + circleLeftPadding + margin.left);
                });
            
            // Starting date
            svg.append("text")
                .classed('moxiechart_card_number_dates', true)
                .attr("font-size", (14 * modifier) + "px")
                .attr("x", function(){
                    return circleSpacing * 1 + circleLeftPadding + margin.left;
                })
                .attr("y", 228 * modifier)
                .attr("text-anchor", "middle")
                .text(data.starting);
            
            // Ending Date
            svg.append("text")
                .classed('moxiechart_card_number_dates', true)
                .attr("font-size", (14 * modifier) + "px")
                .attr("x", function(){
                    return circleSpacing * (data.weeks) + (circleRadius * 2) * (data.weeks-1) + circleLeftPadding + margin.left;
                })
                .attr("y", 228 * modifier)
                .attr("text-anchor", "middle")
                .text(data.ending);
            
            // Draw book text
            svg.append("text")
                .classed('moxiechart_card_number_text', true)
                .attr("font-size", (30 * modifier) + "px")
                .attr("x", 100 * modifier)
                .attr("y", 100 * modifier)
                .attr("text-anchor", "middle")
                .text(data.books);
         
            svg.append("text")
                .classed('moxiechart_card_title_text', true)
                .attr("font-size", (20 * modifier) + "px")
                .attr("x", 100 * modifier)
                .attr("y", 125 * modifier)
                .attr("text-anchor", "middle")
                .text('Books');
            
            // Draw pages text
            svg.append("text")
                .classed('moxiechart_card_number_text', true)
                .attr("font-size", (30 * modifier) + "px")
                .attr("x", 300 * modifier)
                .attr("y", 100 * modifier)
                .attr("text-anchor", "middle")
                .text(data.pages);
         
            svg.append("text")
                .classed('moxiechart_card_title_text', true)
                .attr("font-size", (20 * modifier) + "px")
                .attr("x", 300 * modifier)
                .attr("y", 125 * modifier)
                .attr("text-anchor", "middle")
                .text('Pages');
            
            // Draw moxie text
            svg.append("text")
                .classed('moxiechart_card_number_text', true)
                .attr("font-size", (30 * modifier) + "px")
                .attr("x", 500 * modifier)
                .attr("y", 100 * modifier)
                .attr("text-anchor", "middle")
                .text(data.moxie);
         
            svg.append("text")
                .classed('moxiechart_card_title_text', true)
                .attr("font-size", (20 * modifier) + "px")
                .attr("x", 500 * modifier)
                .attr("y", 125 * modifier)
                .attr("text-anchor", "middle")
                .text('Moxie');
            
            // Reading Challenge tag
            svg.append("text")
                .classed('moxiechart_card_title_tag', true)
                .attr("font-size", (22 * modifier) + "px")
                .attr("x", width/2)
                .attr("y", 280 * modifier)
                .attr("text-anchor", "middle")
                .text(data.messages[data.current_week-1]);
            
            // Reading Challenge weeks left
            svg.append("text")
                .classed('moxiechart_card_weeks_remaining', true)
                .attr("font-size", (20 * modifier) + "px")
                .attr("x", width - (20 * modifier))
                .attr("y", 40 * modifier)
                .attr("text-anchor", "end")
                .text((data.weeks - data.current_week) + ' weeks remaining');
	    }
	    
        var errorCallback = function(){
            moxiechart.createChartError(divSelector, requestedWidth);
        }
        
        // Make the call to get the data and then generate the chart
        this.get({
            jsonURL: jsonURL,
            auth: options.auth,
            callback: initialChartCallback,
            errorCallback: errorCallback
        });
	},
	
	createGenrePiechart : function(requestedWidth, divSelector, jsonURL, options){

	    // Give priority to the parameter of width
	    if(options.width) requestedWidth = options.width;

	    var canvas = d3.select(divSelector)
    	    .append('svg')
    	    .attr({'width': requestedWidth,
    	        'height': requestedWidth
    	    });
	    var modifier = requestedWidth / 600;
	    var fontSize = 24 * modifier;

	    var showSuperGenre = options.showSuperGenre && options.showSuperGenre == 'true';
	    
	    var initialChartCallback = function(dataset) {

	        if(showSuperGenre){
	            dataset = dataset.data['super'];
	        } else {
	            dataset = dataset.data['primary'];
	        }
	        
	        var datasetArr = Object.values(dataset);
	        
	        var colors = ['red','blue'];
	        var colorscale = d3.scale.linear().domain([0, datasetArr.length]).range(colors);

	        var arc = d3.svg.arc()
	        .innerRadius(0)
	        .outerRadius(requestedWidth/2);

	        var arcOver = d3.svg.arc()
	        .innerRadius(0)
	        .outerRadius(requestedWidth/3 + 10);

	        var pie = d3.layout.pie()
	        .value(function(d){ return d.value; });


	        var renderarcs = canvas.append('g')
	        .attr('transform','translate(' + requestedWidth/2 + ',' + requestedWidth/2 + ')')
	        .selectAll('.arc')
	        .data(pie(datasetArr))
	        .enter()
	        .append('g')
	        .attr('class',"arc");

	        renderarcs.append('path')
	        .attr('d',arc)
	        .attr('fill',function(d,i){ return colorscale(i); })
	        .on("mouseover", function(d) {
	            d3.select(this).transition()
	            .duration(1000)
	            .attr("d", arcOver);
	        })
	        .on("mouseout", function(d) {
	            d3.select(this).transition()
	            .duration(1000)
	            .attr("d", arc);
	        });

	        renderarcs.append('text')
	        .attr('transform',function(d) { 
	            var c = arc.centroid(d);
	            
	            var textLabels = [d.data.label];
	            var results = moxiechart._getLabelWidths(textLabels, "", canvas, fontSize);
	            
	            var width = results.labelWidths[0];
	            
	            return "translate(" + (c[0] - width/2) +"," + c[1]+ ")";
	        })
	        .text(function(d){ 
	            return d.data.label; 
            })
	        .style('fill', 'white')
	        .style("font-size", fontSize + "px")
	        .attr('font-family', 'Source Sans Pro');

	    }

	    var errorCallback = function(){
	        moxiechart.createChartError(divSelector, requestedWidth);
	    }
    
	    // Make the call to get the data and then generate the chart
	    this.get({
	        jsonURL: jsonURL,
	        auth: options.auth,
	        callback: initialChartCallback,
	        errorCallback: errorCallback
	    });
	}
};
