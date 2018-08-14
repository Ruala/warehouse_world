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

    /*element togglers premade*/
    (function () {
        /*toggler simple*/
        (function () {
            const $toggler = $('.js__et');
            const options = {};

            $toggler.jElementToggler(options);
        })();

        /*toggler no animate*/
        (function () {
            const $toggler = $('.js__et-na');
            const options = {
                animation: 'none'
            };

            $toggler.jElementToggler(options);
        })();

        /*toggler fade*/
        (function () {
            const $toggler = $('.js__et-fa');
            const options = {
                animation: 'fade'
            };

            $toggler.jElementToggler(options);
        })();

        /*toggler slide*/
        (function () {
            const $toggler = $('.js__et-sla');
            const options = {
                animation: 'slide'
            };

            $toggler.jElementToggler(options);
        })();

        /*toggler simple parent lvl 1*/
        (function () {
            const $toggler = $('.js__et-p1');
            const options = {
                getTarget: function ($btn) {
                    return $btn.parent().find($btn.attr('data-et-target') || $btn.attr('href'));
                }
            };

            $toggler.jElementToggler(options);
        })();

        /*toggler no animate  parent lvl 1*/
        (function () {
            const $toggler = $('.js__et-na-p1');
            const options = {
                getTarget: function ($btn) {
                    return $btn.parent().find($btn.attr('data-et-target') || $btn.attr('href'));
                },
                animation: 'none'
            };

            $toggler.jElementToggler(options);
        })();

        /*toggler fade  parent lvl 1*/
        (function () {
            const $toggler = $('.js__et-fa-p1');
            const options = {
                getTarget: function ($btn) {
                    return $btn.parent().find($btn.attr('data-et-target') || $btn.attr('href'));
                },
                animation: 'fade'
            };

            $toggler.jElementToggler(options);
        })();

        /*toggler slide  parent lvl 1*/
        (function () {
            const $toggler = $('.js__et-sla-p1');
            const options = {
                getTarget: function ($btn) {
                    return $btn.parent().find($btn.attr('data-et-target') || $btn.attr('href'));
                },
                animation: 'slide'
            };

            $toggler.jElementToggler(options);
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

    /*chat togglers*/
    (function () {
        const togglerGroup = {};

        class Chattoggler {
            constructor(options) {
                this.toggler = options.toggler;
                this.isActive = false;
                this.classNames = {
                    active: 'et-active',
                    closeBtn: 'tm-chat-settings-target-close',
                    counter: 'tm-chat-settings-counter',
                };

                this.init();
            }

            init() {
                this.bindElements();
                this.bindHandlers();
                this.attachHandlers();
            }

            bindElements() {
                this.$toggler = $(this.toggler);
                this.groupname = this.$toggler.attr('chat-toggler');
                this.$target = $(this.groupname);
                this.$closeBtn = this.$target.find('.' + this.classNames.closeBtn);
                // implement counter calculation
                this.$counter = this.$target.find('.' + this.classNames.counter);
            }

            bindHandlers() {
                this._toggle = this.toggle.bind(this);
                this._close = this.close.bind(this);
            }

            attachHandlers() {
                this.$toggler.on('click', this._toggle);
                this.$closeBtn.on('click', this._close);
            }

            toggle() {
                if (this.isActive) {
                    this.toggleOff();
                } else {
                    this.toggleOn();
                }
            }

            close(evt) {
                evt.preventDefault();
                this.toggleOff();
            }

            toggleOff() {
                togglerGroup[this.groupname] = togglerGroup[this.groupname] > 0 ? togglerGroup[this.groupname] - 1 : 0;
                this.$toggler.removeClass(this.classNames.active);
                this.isActive = false;
                if (togglerGroup[this.groupname] === 0) {
                    this.hideTarget();
                }
            }

            toggleOn() {
                togglerGroup[this.groupname] = togglerGroup[this.groupname] ? togglerGroup[this.groupname] + 1 : 1;
                this.$toggler.addClass(this.classNames.active);
                this.isActive = true;
                this.showTarget();
            }

            hideTarget() {
                this.$target.fadeOut();
            }

            showTarget() {
                this.$target.fadeIn();
            }
        }

        const $togglers = $('[chat-toggler]');

        $togglers.each(function () {
            new Chattoggler({toggler: this});
        })

    })();

    /*clean view after click*/
    (function () {
        const $bluredItems = $('.tm-blur-control');

        $bluredItems.on('click', function () {
            $(this).removeClass('tm-blur-control');
        });
    })();

    /*chat arrow(carret)*/
    (function () {
        const $chatList = $('.tm-dialog-list');

        if (!$chatList.length) return;

        const $modal = $('#modal-messages');
        const $chat = $('#tm-chat-switcher');
        const setCarret = setCarretTop.bind(null, $chatList);

        setCarret();
        $chat.on('beforeshow show', setCarret);
        $modal.on('beforeshow show', setCarret);
        $chatList.on('scroll', setCarret);

        function setCarretTop($list) {
            const $activeLi = $list.find('> li.uk-active');
            const $inactiveLi = $list.find('> li:not(.uk-active)');
            const $inactiveCarets = $inactiveLi.find('.tm-caret');
            const $carret = $activeLi.find(".tm-caret");

            $inactiveCarets.hide();
            setSameMiddle($activeLi[0], $carret[0]);
            $carret.fadeIn(200);
        }

        function setSameMiddle(base, caret) {
            const baseMiddle = getMiddle(base);
            const caretMiddle = getMiddle(caret);
            const newTop = parseFloat(getComputedStyle(caret).top) + (baseMiddle.y - caretMiddle.y);

            caret.style.top = newTop + 'px';
        }

        function getMiddle(elem) {
            const size = getCoords(elem);
            const width = size.right - size.left;
            const height = size.bottom - size.top;

            return {
                x: size.left + width / 2,
                y: size.top + height / 2,
            };
        }

        function getCoords(elem) {
            const box = elem.getBoundingClientRect();

            return {
                top: box.top + pageYOffset,
                bottom: box.bottom + pageXOffset,
                left: box.left + pageXOffset,
                right: box.right + pageXOffset,
            };

        }
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