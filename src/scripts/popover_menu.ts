angular.module('sfPopoverMenu', [])
    .directive('sfPopoverMenu', popoverMenuDirective)
    .directive('sfPopoverMenuSeparator', popoverMenuSeparatorDirective);

/**
 * Defines the `sf-popover-menu` directive.
 *
 * This directive is used to add a popover menu to a button.
 *
 * BASIC USAGE
 *
 * To create a basic popover menu, add the `sf-popover-menu` attribute to a `<button>` element.
 *
 * The `<button>` element must have a child `<ul>` element containing a list of menu items.
 *
 * ```html
 * <button sf-popover-menu>
 *   <span>Open</span>
 *   <ul>
 *     <li><a href="/foo">Foo</a></li>
 *     <li><a href="/bar">Bar</a></li>
 *     <!-- ... -->
 *   </ul>
 * </button>
 * ```
 *
 * POSITIONING
 *
 * By default, if there's enough space, the popover opens below the button, with the button and
 * popover aligned along their left edges. This positioning can be overridden through the
 * `sf-popover-menu` attribute.
 *
 * The individual properties in this configuration object are documented through
 * `IPopoverMenuConfig`.
 *
 * ```html
 * <button sf-popover-menu="{buttonAttachment: 'bottom right', popoverAttachment: 'bottom left'}">
 *   <!-- ... -->
 * </button>
 * ```
 *
 * OPENING AND CLOSING
 *
 * The popover can be opened and closed by external components through the optional two-way bound
 * `sf-popover-menu-open` attribute.
 *
 * ```html
 * <button sf-popover-menu sf-popover-menu-open="fooCtrl.barIsOpen">
 *   <!-- ... -->
 * </button>
 * ```
 *
 * SEPARATORS
 *
 * The `sf-popover-menu-separator` directive can be used to add separators between menu items.
 *
 * ```html
 * <button sf-popover-menu>
 *   <span>Open</span>
 *   <ul>
 *     <!-- ... -->
 *     <li><a href="/foo">Foo</a></li>
 *     <li sf-popover-menu-separator></li>
 *     <li><a href="/bar">Bar</a></li>
 *     <!-- ... -->
 *   </ul>
 * </button>
 * ```
 *
 * Alternatively the popover menu controller (`IPopoverMenuController`) can be used by child
 * components and directives to open and close the popover directly.
 */
function popoverMenuDirective($document: ng.IDocumentService): ng.IDirective {
    return {
        bindToController: {
            config: '<sfPopoverMenu',
            isOpen: '=?sfPopoverMenuOpen',
        },
        controller: PopoverMenuController,
        controllerAs: 'popoverMenuCtrl',
        scope: true,
        transclude: {
            list: 'ul',
        },
    };
}

/**
 * Defines the `sf-popover-menu-separator` directive.
 *
 * This directive is used to mark a `<li>` element in a popover menu as a separator.
 *
 * USAGE
 *
 * ```html
 * <li sf-popover-menu-separator></li>
 * ```
 */
function popoverMenuSeparatorDirective(): ng.IDirective {
    return {
        link: (scope, element) => {
            element.addClass('popover-menu__separator').attr('role', 'separator');
        },
    };
}

class PopoverMenuController implements ng.IComponentController, IPopoverMenuController {
    /* Static Properties */
    /* ----------------- */

    private static counter = 0;

    /* Constructor */
    /* ----------- */

    public static $inject = ['$attrs', '$document', '$element', '$scope', '$transclude'];

    constructor(
        private attrs: ng.IAttributes,
        private document: ng.IDocumentService,
        private element: ng.IAugmentedJQuery,
        private scope: ng.IScope,
        private transclude: ng.ITranscludeFunction) {
    }

    /* PUBLIC */
    /* ====== */

    /* Properties */
    /* ---------- */

    public config: IPopoverMenuConfig;

    /* Methods */
    /* ------- */

    public $postLink(): void {
        const buttonElement = this.element
            .append(this.transclude())
            .attr('aria-haspopup', 'true')
            .on('click', () => {
                this.isOpen = !this.isOpen;
                this.scope.$apply();
            })
            .on('keydown', this.keyDownHandler)[0];

        buttonElement.id = (buttonElement.id ||
            ('popover-menu-button-' + PopoverMenuController.counter++));

        if (buttonElement instanceof HTMLButtonElement) {
            buttonElement.type = 'button';
        }

        this.applyPopoverState();

        this.linked = true;
    }

    public $onDestroy(): void {
        this.close();
    }

    public get isOpen(): boolean {
        return this._isOpen;
    }

    public set isOpen(value: boolean) {
        value = !!value;

        if (value !== this._isOpen) {
            this._isOpen = value;

            if (this.linked) {
                this.applyPopoverState();
            }
        }
    }

    public close(): void {
        this.isOpen = false;
    }

    public open(): void {
        this.isOpen = true;
    }

    /* Properties */
    /* ---------- */

    private _isOpen: boolean;
    private linked: boolean;
    private list: JQuery;
    private tether: Tether;

    private documentClickHandler = (e: JQueryEventObject): void => {
        if (!e.isDefaultPrevented() && this.list && !this.element[0].contains(e.target) &&
            (jQuery(e.target).is('li > a') || !this.list[0].contains(e.target))) {
            this.close();
            this.scope.$apply();
        }
    };

    private keyDownHandler = (e: JQueryKeyEventObject): void => {
        if (e.isDefaultPrevented()) {
            return;
        }

        switch (e.key) {
            case 'Escape':
                this.element.trigger('focus');
                this.close();
                this.scope.$apply();
                break;
            case 'ArrowUp':
                this.shiftFocus(e.target, -1);
                break;
            case 'ArrowDown':
                this.shiftFocus(e.target, 1);
                break;
            default:
                return;
        }

        e.preventDefault();
    };

    /* Methods */
    /* ------- */

    private applyPopoverState(): void {
        const isOpen = this._isOpen;

        if (isOpen) {
            if (!this.list) {
                this.openPopover();
            }
        } else if (this.list) {
            this.closePopover();
        }

        this.element.attr('aria-expanded', isOpen ? 'true' : 'false');
    }

    private closePopover(): void {
        this.document.off('click', this.documentClickHandler);

        this.tether.destroy();
        this.tether = null;

        this.list.remove();
        this.list = null;
    }

    private openPopover(): void {
        this.list = (<JQuery>(<any>this.transclude)(this.scope, null, null, 'list'))
            .addClass('popover-menu')
            .attr('aria-labelledby', this.element[0].id)
            .on('keydown', this.keyDownHandler)
            .appendTo(this.document[0].body);

        this.tether = new Tether({
            element: this.list,
            attachment: (this.config && this.config.popoverAttachment) || 'top left',
            target: this.element,
            targetAttachment: (this.config && this.config.buttonAttachment) || 'bottom left',
            constraints: [{
                to: 'window',
                attachment: 'together',
            }],
        });

        this.document.on('click', this.documentClickHandler);
    }

    private shiftFocus(startingElement: Element, positions: number): void {
        const list = this.list;

        if (list) {
            const items = list.find('a');

            const maxIndex = items.length - 1;

            let index = items.index(startingElement) + positions;

            if (index < 0) {
                index = maxIndex;
            } else if (index > maxIndex) {
                index = 0;
            }

            items.eq(index).trigger('focus');
        } else {
            this.open();
        }
    }
}

/** Represents the controller for a popover menu. */
interface IPopoverMenuController {
    /* Properties */
    /* ---------- */

    /** true if the popover is open; otherwise, false. */
    isOpen: boolean;

    /* Methods */
    /* ------- */

    /** Closes the popover. */
    close(): void;

    /** Opens the popover. */
    open(): void;
}

/** Represents the configuration of a popover menu. */
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
