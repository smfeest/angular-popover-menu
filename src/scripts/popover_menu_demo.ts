angular.module('sfPopoverMenuDemo', [])
    .directive('sfPopoverMenuDemo', popoverMenuDemoDirective);

function popoverMenuDemoDirective(): ng.IDirective {
    return {
        controller: PopupMenuDemoController,
        controllerAs: 'demoCtrl',
        scope: true,
        templateUrl: 'assets/templates/popover_menu_demo.html',
    };
}

class PopupMenuDemoController {
    public caption = 'Toggle';
}
