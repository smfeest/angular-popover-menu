angular.module('sfPopoverMenu', []).directive('sfPopoverMenu', popoverMenuDirective);

function popoverMenuDirective(): ng.IDirective {
    return {
        link: (scope, element) => {
            const id = element[0].id = (element[0].id || ('popover-menu-' + counter++));

            element.addClass('popover-menu');

            const button = element.children('button').attr('aria-haspopup', 'true');
            const buttonElement = <HTMLButtonElement>button[0];
            const buttonId = buttonElement.id = id + '__button';
            buttonElement.type = 'button';

            element.children('ul')
                .addClass('popover-menu__list')
                .attr('aria-labelledby', buttonId);
        },
    };
}

let counter = 0;