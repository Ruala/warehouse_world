$(document).ready(function () {
    /*select init*/
    (function () {
        const $select = $('select');

        $select.select2();
    })();

    /*custom filters*/
    (function () {
        const $grids = $('.tm-filter-grid');

        $grids.each(function () {
            const $grid = $(this);
            const $items = $grid.find('tr');
            const $container = $grid.closest('.tm-filter-container');
            const $controlContainer = $container.find('.tm-filter-controls');
            const $controlButtons = $controlContainer.find('li');
            const $activeButton = $controlButtons.filter('.uk-active').length ? $controlButtons.filter('.uk-active').eq(0) : $controlButtons.eq(0);

            filterGrid($activeButton, $controlButtons, $items, true);


            $controlContainer.on('click', 'li', function (evt) {
                const $button = $(this);
                evt.preventDefault();

                filterGrid($button, $controlButtons, $items);
            });
        });

        function filterGrid($activeButton, $buttons, $items, forceFilter) {
            const filterValue = $activeButton.attr('data-filter');

            if ($activeButton.hasClass('uk-active') && !forceFilter) {
                return;
            }

            $buttons.removeClass('uk-active');
            $activeButton.addClass('uk-active');

            $items.hide();

            const $visible = $items.filter(filterValue);
            $visible.fadeIn(200);
        }
    })();

    /*custom toggler class*/
    (function () {
        const $togglers = $('[uk-toggle]');

        $togglers.each(function () {
            const $toggler = $(this);
            const selector = $toggler.attr('href') && $toggler.attr('href').length > 2 ?
                $toggler.attr('href') :
                getSelector($toggler.attr('uk-toggle'));
            const $target = $(selector);

            $target.on({
                'beforeshow': function () {
                    $toggler.addClass('uk-active');
                },
                'hidden': function () {
                    $toggler.removeClass('uk-active');
                }
            });
        });

        function getSelector(str) {
            const start = 'target: ';
            const end = ';';

            if (!~str.indexOf(start)) return null;

            const startPos = str.indexOf(start) + start.length;
            let endPos = ~str.indexOf(end, startPos) ? str.indexOf(end, startPos) : undefined;

            return str.slice(startPos, endPos);
        }
    })();

    /*sort*/
    (function () {

    })();

    /*charts*/
    (function () {
        const $charts = $('[bar-chart]');

        $charts.each(function () {
            const el = this;
            const $el = $(this);
            const $accordion = $el.closest('[uk-accordion]');
            const chart = echarts.init(el);
            const option = el.getAttribute('bar-chart').length > 2 ?
                JSON.stringify(el.getAttribute('bar-chart')) :
                {
                    tooltip: {
                        trigger: 'axis',
                        // axisPointer: {
                        //     type: 'shadow',
                        // }
                    },
                    toolbox: {
                        show: true,
                        orient: 'vertical',
                        left: 'right',
                        top: 'center',
                        feature: {
                            mark: { show: true },
                            dataView: { show: true, readOnly: false },
                            magicType: { show: true, type: ['line', 'bar', 'stack', 'tiled'] },
                            restore: { show: true },
                            saveAsImage: { show: true },
                        },
                    },
                    xAxis: {
                        type: 'category',
                        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [{
                        data: [820, 932, 901, 934, 1290, 1330, 1320],
                        type: 'line'
                    }]
                };

            // use configuration item and data specified to show chart
            chart.setOption(option);

            $accordion.on('show shown', function () {
                if (!$el.closest('.uk-open').length) return;

                chart.resize();
            });

            $(window).on('resize', chart.resize.bind(chart));
        });
    })();
});