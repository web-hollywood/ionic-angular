# chart-prototype
CHART Prototype data

Ionic Integration
  http://gonehybrid.com/bring-your-ionic-app-to-life-getting-started-with-d3-js/
  https://github.com/pjain11/ionic-D3-Example/blob/master/www/index.html
  http://spr.com/how-to-build-reusable-responsive-d3-charts-in-angularionic-apps/
  
Growth Chart
Note: Tooltips are working for the growth chart badly for the moxie app, because the ionic app is using transform to do the scrolling, so I can never get scrolltop of the chart div, because it literally never gets scrolled. Instead I am going up the dom heirarchy to get the ancestor which has the class 'scroll'. From this I retrieve the transform style and turn that into a scrolltop as such, so I can position the tooltips correctly. If in the future this chart is used in another application or webpage, and in the ancestor tree the class scroll is used, this will cause problems. The way to get around this would be to send in a callback to the chart function which calculates the scrolltop using whatever scrolling mechanism the iconic app is using.
