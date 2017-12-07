(function (global, React, ReactDOM) {
    const SELECTOR_FIELD = '.ez-field-edit--ezobjectrelationlist';
    const SELECTOR_INPUT = '.ez-data-source__input';
    const SELECTOR_FIELD_INPUT = `${SELECTOR_FIELD} ${SELECTOR_INPUT}`;
    const SELECTOR_LABEL_WRAPPER = '.ez-field-edit__label-wrapper';

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
                    selector: SELECTOR_FIELD_INPUT,
                    eventName: 'blur',
                    callback: 'validateInput',
                    errorNodeSelectors: [SELECTOR_LABEL_WRAPPER]
                },
                {
                    isValueValidator: false,
                    selector: SELECTOR_FIELD_INPUT,
                    eventName: 'validateInput',
                    callback: 'validateInput',
                    errorNodeSelectors: [SELECTOR_LABEL_WRAPPER]
                }
            ]
        });
        const udwContainer = document.getElementById('react-udw');
        const token = document.querySelector('meta[name="CSRF-Token"]').content;
        const siteaccess = document.querySelector('meta[name="SiteAccess"]').content;
        const sourceInput = fieldContainer.querySelector(SELECTOR_INPUT);
        const relationsContainer = fieldContainer.querySelector('.ez-relations__list');
        const relationsWrapper = fieldContainer.querySelector('.ez-relations__wrapper');
        const relationsCTA = fieldContainer.querySelector('.ez-relations__cta');
        const closeUDW = () => udwContainer.innerHTML = '';
        const updateInputValue = (items) => sourceInput.value = items.map(item => item.id).join();
        const onConfirm = (items) => {
            items = excludeDuplicatedItems(items);
            selectedItems = [...selectedItems, ...items];

            updateInputValue(selectedItems);
            renderRows(items);
            closeUDW();

            relationsWrapper.removeAttribute('hidden');
            relationsCTA.setAttribute('hidden', true);
        };
        const onCancel = () => closeUDW();
        const canSelectContent = (item, callback) => {
            const canSelect = !selectedItems.find(selectedItem => selectedItem.id === item.id);

            callback(canSelect);
        };
        const openUDW = (event) => {
            event.preventDefault();

            ReactDOM.render(React.createElement(global.eZ.modules.UniversalDiscovery, {
                onConfirm,
                onCancel,
                confirmLabel: 'Confirm selection',
                title: 'Select content',
                multiple: true,
                selectedItemsLimit: 3,
                restInfo: { token, siteaccess },
                canSelectContent
            }), udwContainer);
        };
        const excludeDuplicatedItems = (items) => {
            selectedItemsMap = items.reduce((total, item) => Object.assign({}, total, { [item.id]: item }), selectedItemsMap);

            return items.filter(item => selectedItemsMap[item.id]);
        };
        const renderRow = (item, index) => {
            return `
                <tr class="ez-relations__item" data-content-id="${item.id}">
                    <td><input type="checkbox" value="${item.id}" /></td>
                    <td>${item.ContentInfo.Content.Name}</td>
                    <td>${item.ContentInfo.Content.ContentType._href}</td>
                    <td>${(new Date(item.ContentInfo.Content.publishedDate)).toLocaleString()}</td>
                    <td><input class="ez-relations__order-input" type="number" value="${index + 1}" /></td>
                </tr>
            `;
        };
        const renderRows = (items) => items.forEach((...args) => relationsContainer.insertAdjacentHTML('beforeend', renderRow(...args)));
        let selectedItems = [];
        let selectedItemsMap = {};

        [
            ...fieldContainer.querySelectorAll('.ez-relations__table-action--create'),
            ...fieldContainer.querySelectorAll('.ez-relations__cta-btn')
        ].forEach(btn => btn.addEventListener('click', openUDW, false));

        validator.init();

        global.eZ.fieldTypeValidators = global.eZ.fieldTypeValidators ?
            [...global.eZ.fieldTypeValidators, validator] :
            [validator];
    });
})(window, window.React, window.ReactDOM);
