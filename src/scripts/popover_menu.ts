angular.module('sfPopoverMenu', []).directive('sfPopoverMenu', popoverMenuDirective);

function popoverMenuDirective(): ng.IDirective {
    let counter = 0;

    return {
        link: (scope, element) => {
            const id = element[0].id = (element[0].id || ('popover-menu-' + counter++));

            element.addClass('popover-menu');

            const button = element.children('button')
                .attr('aria-haspopup', 'true')
                .on('click', toggle);
            const buttonElement = <HTMLButtonElement>button[0];
            const buttonId = buttonElement.id = id + '__button';
            buttonElement.type = 'button';

            element.children('ul')
                .addClass('popover-menu__list')
                .attr('aria-labelledby', buttonId);

            close();

            const OPEN_MODIFIER = 'popover-menu--open';
            const EXPANDED_ATTRIBUTE = 'aria-expanded';

            function toggle(): void {
                if (element.hasClass(OPEN_MODIFIER)) {
                    close();
                } else {
                    open();
                }
            }

            function open(): void {
                element.addClass(OPEN_MODIFIER);
                button.attr(EXPANDED_ATTRIBUTE, 'true');
            }

            function close(): void {
                element.removeClass(OPEN_MODIFIER);
                button.attr(EXPANDED_ATTRIBUTE, 'false');
            }
        },
    };
}
