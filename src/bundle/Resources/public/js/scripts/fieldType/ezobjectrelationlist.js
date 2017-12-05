(function (global, React, ReactDOM) {
    const SELECTOR_FIELD = '.ez-field-edit--ezobjectrelationlist';

    class EzObjectRelationListValidator extends global.eZ.BaseFieldValidator {
        /**
         * Validates the input
         *
         * @method validateInput
         * @param {Event} event
         * @returns {Object}
         * @memberof EzObjectRelationListValidator
         */
        validateInput(event) {
            console.log('TODO:validation');

            return {isError: false, event};
        }
    }

    [...document.querySelectorAll(SELECTOR_FIELD)].forEach(fieldContainer => {
        const validator = new EzObjectRelationListValidator({
            classInvalid: 'is-invalid',
            fieldContainer,
            eventsMap: [
                {
                    selector: `${SELECTOR_FIELD} input`,
                    eventName: 'blur',
                    callback: 'validateInput',
                    errorNodeSelectors: ['.ez-field-edit__label-wrapper'],
                },
            ],
        });
        const udwContainer = document.getElementById('react-udw');
        const token = document.querySelector('meta[name="CSRF-Token"]').content;
        const siteaccess = document.querySelector('meta[name="SiteAccess"]').content;
        const closeUDW = () => udwContainer.innerHTML = '';
        const onConfirm = (items) => {
            console.log('onConfirm', items);

            closeUDW();
        };
        const onCancel = () => closeUDW();
        const openUDW = (event) => {
            event.preventDefault();

            ReactDOM.render(React.createElement(global.eZ.modules.UniversalDiscovery, {
                onConfirm,
                onCancel,
                confirmLabel: 'Confirm selection',
                title: 'Select content',
                multiple: true,
                selectedItemsLimit: 3,
                restInfo: { token, siteaccess }
            }), udwContainer);
        };

        [...fieldContainer.querySelectorAll('.ez-table__action--create')].forEach(btn => btn.addEventListener('click', openUDW, false));

        validator.init();

        global.eZ.fieldTypeValidators = global.eZ.fieldTypeValidators ?
            [...global.eZ.fieldTypeValidators, validator] :
            [validator];
    });
})(window, window.React, window.ReactDOM);
