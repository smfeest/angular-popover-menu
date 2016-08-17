angular.module('sfPopoverMenu', []).directive('sfPopoverMenu', popoverMenuDirective);

function popoverMenuDirective($document: ng.IDocumentService): ng.IDirective {
    let counter = 0;

    return {
        transclude: {
            button: 'button',
            list: 'ul',
        },
        link: (scope, element, attrs, ctrl, transclude) => {
            const OPEN_MODIFIER = 'popover-menu--open';
            const CONFIG_ATTRIBUTE = 'sfPopoverMenu';
            const EXPANDED_ATTRIBUTE = 'aria-expanded';

            let list: ng.IAugmentedJQuery;
            let tether: Tether;

            const config: IPopoverMenuConfig = attrs[CONFIG_ATTRIBUTE] &&
                scope.$eval(attrs[CONFIG_ATTRIBUTE]);

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

            element.on('$destroy', close);

            function toggle(): void {
                if (list) {
                    close();
                } else {
                    open();
                }
            }

            function open(): void {
                if (!list) {
                    list = (<JQuery>(<any>transclude)(scope, null, null, 'list'))
                        .addClass('popover-menu__list')
                        .attr('aria-labelledby', buttonId)
                        .on('keydown', onKeyDown)
                        .appendTo(element);

                    tether = new Tether({
                        element: list,
                        attachment: (config && config.popoverAttachment) || 'top left',
                        target: button,
                        targetAttachment: (config && config.buttonAttachment) || 'bottom left',
                        constraints: [{
                            to: 'window',
                            attachment: 'together',
                        }],
                    });

                    element.addClass(OPEN_MODIFIER);
                    button.attr(EXPANDED_ATTRIBUTE, 'true');

                    $document.on('click', onDocumentClick);
                }
            }

            function close(): void {
                if (list) {
                    $document.off('click', onDocumentClick);

                    tether.destroy();
                    tether = null;

                    list.remove();
                    list = null;
                }

                element.removeClass(OPEN_MODIFIER);
                button.attr(EXPANDED_ATTRIBUTE, 'false');
            }

            function onDocumentClick(e: JQueryEventObject): void {
                if (!(e.isDefaultPrevented() || element[0].contains(e.target))) {
                    close();
                }
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

interface IPopoverMenuConfig {
    /**
     * The button's attachment point
     *
     * If specified, this property should be in the form
     * '{vertical-attachment} {horizontal-attachment}' where `{vertical-attachment}` is 'top',
     * 'middle' or 'bottom' and `{horizontal-attachment}` is 'left', 'center' or 'right'.
     *
     * If unspecified, 'bottom left' is assumed.
     */
    buttonAttachment?: string;

    /**
     * The popover's attachment point
     *
     * If specified, this property should be in the form
     * '{vertical-attachment} {horizontal-attachment}' where `{vertical-attachment}` is 'top',
     * 'middle' or 'bottom' and `{horizontal-attachment}` is 'left', 'center' or 'right'.
     *
     * If unspecified, 'top left' is assumed.
     */
    popoverAttachment?: string;
}

popoverMenuDirective.$inject = ['$document'];
