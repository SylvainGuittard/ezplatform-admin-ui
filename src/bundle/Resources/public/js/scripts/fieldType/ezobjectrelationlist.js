(function (global, React, ReactDOM) {
    const SELECTOR_FIELD = '.ez-field-edit--ezobjectrelationlist';
    const SELECTOR_INPUT = '.ez-data-source__input';
    const SELECTOR_FIELD_INPUT = `${SELECTOR_FIELD} ${SELECTOR_INPUT}`;
    const SELECTOR_LABEL_WRAPPER = '.ez-field-edit__label-wrapper';
    const SELECTOR_BTN_ADD = '.ez-relations__table-action--create';

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
        const addBtn = fieldContainer.querySelector(SELECTOR_BTN_ADD)
        const selectedItemsLimit = 6;
        const closeUDW = () => udwContainer.innerHTML = '';
        const updateInputValue = (items) => sourceInput.value = items.join();
        const onConfirm = (items) => {
            items = excludeDuplicatedItems(items);

            renderRows(items);

            selectedItems = [...selectedItems, ...items.map(item => item.id)];

            updateInputValue(selectedItems);
            closeUDW();
            updateFieldState();
            updateAddBtnState();
        };
        const onCancel = () => closeUDW();
        const canSelectContent = (item, callback) => {
            const canSelect = selectedItems.length < selectedItemsLimit &&
                !selectedItems.find(id => id === item.id);

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
                selectedItemsLimit,
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
                    <td><input class="ez-relations__order-input" type="number" value="${selectedItems.length + index + 1}" /></td>
                </tr>
            `;
        };
        const renderRows = (items) => items.forEach((...args) => relationsContainer.insertAdjacentHTML('beforeend', renderRow(...args)));
        const updateFieldState = () => {
            const wrapperMethod = selectedItems.length ? 'removeAttribute' : 'setAttribute';
            const ctaMethod = selectedItems.length ? 'setAttribute' : 'removeAttribute';

            relationsWrapper[wrapperMethod]('hidden', true);
            relationsCTA[ctaMethod]('hidden', true);
        };
        const updateAddBtnState = () => {
            const methodName = selectedItems.length < selectedItemsLimit ? 'removeAttribute' : 'setAttribute';

            addBtn[methodName]('disabled', true);
        };
        const removeItem = (event) => {
            event.preventDefault();

            const removedItems = [];

            [...relationsContainer.querySelectorAll('input:checked')].forEach(input => {
                removedItems.push(parseInt(input.value, 10));

                input.closest('tr').remove();
            });

            selectedItems = selectedItems.filter(item => !removedItems.includes(item));

            updateInputValue(selectedItems);
            updateFieldState();
            updateAddBtnState();
        };
        let selectedItems = [];
        let selectedItemsMap = {};

        [
            ...fieldContainer.querySelectorAll(SELECTOR_BTN_ADD),
            ...fieldContainer.querySelectorAll('.ez-relations__cta-btn')
        ].forEach(btn => btn.addEventListener('click', openUDW, false));

        fieldContainer.querySelector('.ez-relations__table-action--remove').addEventListener('click', removeItem, false);

        validator.init();

        global.eZ.fieldTypeValidators = global.eZ.fieldTypeValidators ?
            [...global.eZ.fieldTypeValidators, validator] :
            [validator];
    });
})(window, window.React, window.ReactDOM);
