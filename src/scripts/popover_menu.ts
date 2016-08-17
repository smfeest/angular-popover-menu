angular.module('sfPopoverMenu', []).directive('sfPopoverMenu', popoverMenuDirective);

function popoverMenuDirective(): ng.IDirective {
    let counter = 0;

    return {
        transclude: {
            button: 'button',
            list: 'ul',
        },
        link: (scope, element, attrs, ctrl, transclude) => {
            const OPEN_MODIFIER = 'popover-menu--open';
            const EXPANDED_ATTRIBUTE = 'aria-expanded';

            let list: ng.IAugmentedJQuery;

            const id = element[0].id = (element[0].id || ('popover-menu-' + counter++));

            element.addClass('popover-menu');

            const button = (<JQuery>(<any>transclude)(scope, null, null, 'button'))
                .attr('aria-haspopup', 'true')
                .on('click', toggle)
                .on('keydown', onKeyDown)
                .appendTo(element);
            const buttonElement = <HTMLButtonElement>button[0];
            const buttonId = buttonElement.id = id + '__button';
            buttonElement.type = 'button';

            close();

            function toggle(): void {
                if (list) {
                    close();
                } else {
                    open();
                }
            }

            function open(): void {
                list = (<JQuery>(<any>transclude)(scope, null, null, 'list'))
                    .addClass('popover-menu__list')
                    .attr('aria-labelledby', buttonId)
                    .on('keydown', onKeyDown)
                    .appendTo(element);

                element.addClass(OPEN_MODIFIER);
                button.attr(EXPANDED_ATTRIBUTE, 'true');
            }

            function close(): void {
                if (list) {
                    list.remove();
                    list = null;
                }

                element.removeClass(OPEN_MODIFIER);
                button.attr(EXPANDED_ATTRIBUTE, 'false');
            }

            function onKeyDown(e: JQueryKeyEventObject): void {
                if (e.isDefaultPrevented()) {
                    return;
                }

                switch (e.key) {
                    case 'Escape':
                        button.trigger('focus');
                        close();
                        break;
                    case 'ArrowUp':
                        shiftFocus(-1);
                        break;
                    case 'ArrowDown':
                        shiftFocus(1);
                        break;
                    default:
                        return;
                }

                e.preventDefault();

                function shiftFocus(shift: number): void {
                    if (list) {
                        const items = list.find('a');

                        const maxIndex = items.length - 1;

                        let index = items.index(e.target) + shift;

                        if (index < 0) {
                            index = maxIndex;
                        } else if (index > maxIndex) {
                            index = 0;
                        }

                        items.eq(index).trigger('focus');
                    } else {
                        open();
                    }
                }
            }
        },
    };
}
