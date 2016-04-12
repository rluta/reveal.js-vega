var RevealVega = window.RevealVega || (function(){

    var createChart = function(base,vgspec,comments) {
        var spec = vgspec;
        // data-chart: vega => full vega specification
        // data-chart: vega-lite => vega lite spec
        if (base.getAttribute('data-chart') !== 'vega') {
            spec = vl.compile(vgspec).spec;
        }
        vg.parse.spec(spec,function (chart) {
            base.chart = chart;
            base.spec = spec;
            chart({el:base}).update();
        });
    };

    var initializeCharts = function(){
        // Get all canvases
        var charts = document.querySelectorAll("[data-chart|='vega']");
        for (var i = 0; i < charts.length; i++ ){
            var chart = charts[i];
            var spec = charts[i].innerHTML.trim();
            var comments = spec.match(/<!--[\s\S]*?-->/g);
            spec = spec.replace(/<!--[\s\S]*?-->/g,'').replace(/^\s*\n/gm, "")
            if ( ! chart.hasAttribute("data-chart-src") ) {
                createChart(chart, spec, comments);
            } else {
                var xhr = new XMLHttpRequest(),
                    url = chart.getAttribute("data-chart-src");
                xhr.onload = function() {
                    if (xhr.readyState === 4) {
                        createChart(chart, xhr.responseText, comments);
                    }
                    else {
                        console.warn( 'Failed to get file ' + url +". ReadyState: " + xhr.readyState + ", Status: " + xhr.status);
                    }
                };

                xhr.open( 'GET', url, false );
                try {
                    xhr.send();
                }
                catch ( error ) {
                    console.warn( 'Failed to get file ' + url + '. Make sure that the presentation and the file are served by a HTTP server and the file can be found there. ' + error );
                }
            }
        }
    }

    // load external scripts
    var body = document.getElementsByTagName('body')[0];
    if (!window.d3) {
        var d3 = document.createElement('script');
        d3.src = '//d3js.org/d3.v3.min.js';
        body.appendChild(d3);
    }
    if (!window.vg) {
        var vega = document.createElement('script');
        vega.src='//vega.github.io/vega/vega.js';
        body.appendChild(vega);
        var vegalite = document.createElement('script');
        vegalite.src='//vega.github.io/vega-lite/vega-lite.js';
        body.appendChild(vegalite);
    }

    Reveal.addEventListener('ready', function(){
        initializeCharts();
        Reveal.addEventListener('slidechanged', function(){
            var charts = Reveal.getCurrentSlide().querySelectorAll("[data-chart|='vega']");
            for (var i = 0; i < charts.length; i++ ){
                if ( charts[i].chart ){
                    charts.chart.update();
                }
            }
        });
    });
})();