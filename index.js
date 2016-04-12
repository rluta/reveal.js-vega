var RevealVega = window.RevealVega || (function(){

        var createChart = function(base,vgspec) {
            var spec = vgspec;
            // data-chart: vega => full vega specification
            // data-chart: vega-lite => vega lite spec
            if (base.getAttribute('type') !== 'vega') {
                spec = window.vl.compile(JSON.parse(vgspec)).spec;
            }
            vg.parse.spec(spec,function (chart) {
                base._chart = chart;
                base._spec = spec;
                chart({el:base}).update();
            });
        };

        var initializeCharts = function(){
            // don't create charts before all libs are available
            if (!window.vg || !window.vl || !window.d3) {
                setTimeout(initializeCharts,50);
                return;
            }
            // Get all canvases
            var charts = document.querySelectorAll("chart[type|='vega']");
            for (var i = 0; i < charts.length; i++ ){
                var chart = charts[i];
                if ( ! chart.hasAttribute("src") ) {
                    var specs = chart.getElementsByTagName('spec');
                    if (specs.length > 0) {
                        createChart(chart, specs[0].textContent);
                    }
                } else {
                    var xhr = new XMLHttpRequest(),
                        url = chart.getAttribute("src");
                    xhr.onload = function() {
                        if (xhr.readyState === 4) {
                            createChart(chart, xhr.responseText);
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

        // load vega only when D3 is available, otherwise vega will complain and may crash
        (function loadVega() {
            if (!window.d3) { setTimeout(loadVega, 50); return }
            if (!window.vg) {
                var vega = document.createElement('script');
                vega.src = '//vega.github.io/vega/vega.js';
                body.appendChild(vega);
            }
            if (!window.vl) {
                var vegalite = document.createElement('script');
                vegalite.src = '//vega.github.io/vega-lite/vega-lite.js';
                body.appendChild(vegalite);
            }
        })();

        var style = document.createElement('style');
        style.textContent="chart > spec { display: none; }"
        body.appendChild(style)

        Reveal.addEventListener('ready', function(){
            initializeCharts();
        });

        /*
        Reveal.addEventListener('slidechanged', function(){
            var charts = Reveal.getCurrentSlide().querySelectorAll("chart[type|='vega']");
            for (var i = 0; i < charts.length; i++ ){
                if ( charts[i].chart ){
                    charts[i].chart({el:charts[i]}).update();
                }
            }
        });
        */
    })();