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


            $controlContainer.on('click', 'li', function(evt) {
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
});