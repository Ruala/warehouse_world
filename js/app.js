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

    /*element togglers*/
    (function () {
        /*toggler simple*/
        (function() {
            var $toggler = $('.js__et', context);
            var options = {};

            $toggler.once(function () {
                $(this).jElementToggler(options);
            });
        })();

        /*toggler no animate*/
        (function() {
            var $toggler = $('.js__et-na', context);
            var options = {
                animation: 'none'
            };

            $toggler.once(function () {
                $(this).jElementToggler(options);
            });
        })();

        /*toggler fade*/
        (function() {
            var $toggler = $('.js__et-fa', context);
            var options = {
                animation: 'fade'
            };

            $toggler.once(function () {
                $(this).jElementToggler(options);
            });
        })();

        /*toggler slide*/
        (function() {
            var $toggler = $('.js__et-sla', context);
            var options = {
                animation: 'slide'
            };

            $toggler.once(function () {
                $(this).jElementToggler(options);
            });
        })();

        /*toggler simple parent lvl 1*/
        (function() {
            var $toggler = $('.js__et-p1', context);
            var options = {
                getTarget: function ($btn) {
                    return $btn.parent().find($btn.attr('data-et-target') || $btn.attr('href'));
                }
            };

            $toggler.once(function () {
                $(this).jElementToggler(options);
            });
        })();

        /*toggler no animate  parent lvl 1*/
        (function() {
            var $toggler = $('.js__et-na-p1', context);
            var options = {
                getTarget: function ($btn) {
                    return $btn.parent().find($btn.attr('data-et-target') || $btn.attr('href'));
                },
                animation: 'none'
            };

            $toggler.once(function () {
                $(this).jElementToggler(options);
            });
        })();

        /*toggler fade  parent lvl 1*/
        (function() {
            var $toggler = $('.js__et-fa-p1', context);
            var options = {
                getTarget: function ($btn) {
                    return $btn.parent().find($btn.attr('data-et-target') || $btn.attr('href'));
                },
                animation: 'fade'
            };

            $toggler.once(function () {
                $(this).jElementToggler(options);
            });
        })();

        /*toggler slide  parent lvl 1*/
        (function() {
            var $toggler = $('.js__et-sla-p1', context);
            var options = {
                getTarget: function ($btn) {
                    return $btn.parent().find($btn.attr('data-et-target') || $btn.attr('href'));
                },
                animation: 'slide'
            };

            $toggler.once(function () {
                $(this).jElementToggler(options);
            });
        })();
    })();

    /*table togglers*/
    (function () {
        const $tables = $('.js__et-table');

        $tables.each(function (el, i) {
            const $table = $(this);
            const $rows = $table.find('tbody > tr');
            const options = {
                animation: 'none',
                groupName: 'table-togglers-' + i,
            };

            $rows.jElementToggler(options);
        });
    })();

    /*sort*/
    (function () {
        const $sortingContainer = $('.tm-table-sort');

        $sortingContainer.each(function () {
            const $container = $(this);
            const $headCols = $container.find('thead th');
            const $tbody = $container.find('tbody');
            const $rows = $container.find('tbody > tr');

            $headCols.not($headCols.eq(0)).on('click', function () {
                const $filterCol = $(this);
                const $btn = $filterCol.find('button');

                $headCols.removeClass('tm-active');
                $filterCol.addClass('tm-active');
                $headCols.not('.tm-active')
                    .find('.tm-filter-min-to-max, .tm-filter-max-to-min')
                    .removeClass('tm-filter-min-to-max tm-filter-max-to-min');

                if ($btn.hasClass('tm-filter-min-to-max')) {
                    $btn.removeClass('tm-filter-min-to-max');
                    $btn.addClass('tm-filter-max-to-min');
                    sortRows(1);
                } else if ($btn.hasClass('tm-filter-max-to-min')) {
                    $btn.removeClass('tm-filter-max-to-min');
                    $btn.addClass('tm-filter-min-to-max');
                    sortRows();
                } else {
                    $btn.addClass('tm-filter-min-to-max');
                    sortRows();
                }

                function sortRows(order) {
                    const collIndex = $headCols.index($filterCol);

                    $rows.sort(function (a, b) {
                        const x = +$(a).find('> td').eq(collIndex).text();
                        const y = +$(b).find('> td').eq(collIndex).text();

                        return order ? y - x : x - y;
                    });

                    $rows.detach().appendTo($tbody);
                }
            });
        });
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
                            mark: {show: true},
                            dataView: {show: true, readOnly: false},
                            magicType: {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                            restore: {show: true},
                            saveAsImage: {show: true},
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