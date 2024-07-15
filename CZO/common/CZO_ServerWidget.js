define([
    'N/ui/serverWidget',
    'N/ui/message'
], (serverWidget, message) => {
    class Field {
        constructor(field) {
            this.field = field;
        };

        set defaultValue(value) {
            if (this.field) {
                this.field.defaultValue = value;
            }
        };

        set isMandatory(value) {
            if (this.field) {
                this.field.isMandatory = value;
            }
        };

        updateDisplayType(options) {
            if (this.field) {
                this.field.updateDisplayType(options);
            }
        };

        updateDisplaySize(options) {
            if (this.field) {
                this.field.updateDisplaySize(options);
            }
        }

        updateLayoutType(options) {
            if (this.field) {
                this.field.updateLayoutType(options);
            }
        };

        updateBreakType(options) {
            if (this.field) {
                this.field.updateBreakType(options);
            }
        };

        hide() {
            this.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
        };

        show() {
            this.updateDisplayType({displayType: serverWidget.FieldDisplayType.NORMAL});
        };

        disable() {
            this.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
        };

        removeSelectOption(options) {
            if (this.field) {
                this.field.removeSelectOption(options);
            }
        };

        addSelectOption(options) {
            if (this.field) {
                this.field.addSelectOption(options);
            }
        };
    }

    class Sublist {
        constructor(sublist) {
            this.sublist = sublist;
        };

        addButton(options) {
            if (this.sublist) {
                return this.sublist.addButton(options);
            }
        };

        hide() {
            this.sublist.displayType = serverWidget.SublistDisplayType.HIDDEN;
        };

        addField(options) {
            return new Field(this.sublist.addField(options));
        };

        getField(options) {
            return new Field(this.sublist.getField(options));
        };

        addFields(fields) {
            let me = this;
            fields.forEach((field) => {
                let fld = me.addField({
                    id: field.id,
                    label: field.label,
                    type: field.type,
                    source: field.source || ''
                });
                if (field.displayType) {
                    fld.updateDisplayType({
                        displayType: field.displayType
                    });
                }
                if (field.isMandatory) {
                    fld.require();
                }
                if (field.height && field.width) {
                    fld.updateDisplaySize({
                        height: field.height,
                        width: field.width
                    });
                }
                if (field.selectOptions) {
                    field.selectOptions.forEach((selectOption) => {
                        fld.addSelectOption(selectOption);
                    });
                }
                if (field.defaultValue) {
                    field.defaultValue = field.defaultValue;
                }
            });
        };

        addLineItems(items) {
            for (let i = 0, ii = items.length; i < ii; i++) {
                let item = items[i];
                for (let fieldId in item) {
                    let value = item[fieldId];
                    if (value) {
                        this.sublist.setSublistValue({id: fieldId, line: i, value: value});
                    }
                }
            }
        };

        hideFields(options) {
            let me = this;
            options.fields.forEach((id) => {
                let field = me.getField({id: id});
                if (field) {
                    field.hide();
                }
            });
        };

        requireFields(options) {
            let me = this;
            options.fields.forEach((id) => {
                let field = me.getField({id: id});
                if (field) {
                    field.isMandatory = true;
                }
            });
        };

        setSublistValue(options) {
            if (this.sublist) {
                this.sublist.setSublistValue(options);
            }
        };

        getLineCount() {
            return this.sublist ? this.sublist.lineCount : -1;
        };

        addMarkAllButtons() {
            this.sublist.addMarkAllButtons();
        }
    }

    class Form {
        constructor(form) {
            this.nsForm = form;
        };

        set clientScriptModulePath(value) {
            this.nsForm.clientScriptModulePath = value;
        };

        getField(options) {
            return new Field(this.nsForm.getField(options));
        };

        addField(options) {
            let field = new Field(this.nsForm.addField(options));
            if (options.selectOptions) {
                options.selectOptions.forEach((selectOption) => {
                    field.addSelectOption(selectOption);
                });
            }
            if (options.displayType) {
                field.updateDisplayType({displayType: options.displayType});
            }
            if (options.layoutType) {
                field.updateLayoutType({layoutType: options.layoutType});
            }
            if (options.breakType) {
                field.updateBreakType({breakType: options.breakType});
            }
            if (options.defaultValue) {
                field.defaultValue = options.defaultValue;
            }
            if (options.isMandatory) {
                field.isMandatory = options.isMandatory;
            }

            return field;
        };

        addInlineHtmlField(options) {
            options.type = serverWidget.FieldType.INLINEHTML;
            return this.addField(options);
        };

        addLongTextField(options) {
            options.type = serverWidget.FieldType.LONGTEXT;
            return this.addField(options);
        };

        addTextField(options) {
            options.type = serverWidget.FieldType.TEXT;
            return this.addField(options);
        };

        addCheckBoxField(options) {
            options.type = serverWidget.FieldType.CHECKBOX;
            return this.addField(options);
        };

        addSelectField(options) {
            options.type = serverWidget.FieldType.SELECT;
            return this.addField(options);
        };

        addDateField(options) {
            options.type = serverWidget.FieldType.DATE;
            return this.addField(options);
        };

        addFileField(options) {
            options.type = serverWidget.FieldType.FILE;
            return this.addField(options);
        };

        addFields(options) {
            let me = this;
            options.fields.forEach((fieldOptions) => {
                fieldOptions.container = options.container;
                me.addField(fieldOptions);
            });
        };

        hideFields(options) {
            let me = this;
            options.fields.forEach((id) => {
                let field = me.getField({id: id});
                if (field) {
                    field.hide();
                }
            });
        };

        insertField(options) {
            this.nsForm.insertField(options);
        };

        getSublist(options) {
            return new Sublist(this.nsForm.getSublist(options));
        };

        addSublist(options) {
            return new Sublist(this.nsForm.addSublist(options));
        };

        hideSublist(options) {
            let sublist = this.nsForm.getSublist(options);
            if (sublist) {
                sublist.displayType = serverWidget.SublistDisplayType.HIDDEN;
            }
        };

        getButton(options) {
            return this.nsForm.getButton(options);
        };

        addButton(options) {
            return this.nsForm.addButton(options);
        };

        removeButton(options) {
            this.nsForm.removeButton(options);
        };

        disableFields(fieldIds, editableFieldIds) {
            let me = this;
            editableFieldIds = editableFieldIds || [];
            fieldIds.forEach((id) => {
                if (editableFieldIds.indexOf(id) < 0) {
                    let field = me.getField({id: id});
                    if (field) {
                        field.disable();
                    }
                }
            });
        };

        addSubtab(options) {
            return this.nsForm.addSubtab(options);
        };

        addTab(options) {
            return this.nsForm.addTab(options);
        };

        insertSubtab(options) {
            this.nsForm.insertSubtab(options);
        };

        insertSublist(options) {
            this.nsForm.insertSublist(options);
        };

        addSubmitButton(options) {
            return this.nsForm.addSubmitButton(options);
        };

        addResetButton(options) {
            return this.nsForm.addResetButton(options);
        };

        addFieldGroup(options) {
            return this.nsForm.addFieldGroup(options);
        };

        addPageInitMessage(options) {
            this.nsForm.addPageInitMessage(options);
        };

        addPageInitErrorMessage(options) {
            options.type = message.Type.ERROR;
            this.addPageInitMessage(options);
        };

        addPageInitWarningMessage(options) {
            options.type = message.Type.WARNING;
            this.addPageInitMessage(options);
        };

        addPageInitInfoMessage(options) {
            options.type = message.Type.INFORMATION;
            this.addPageInitMessage(options);
        };
    }

    return {
        get FieldType() {
            return serverWidget.FieldType;
        },
        get FieldDisplayType() {
            return serverWidget.FieldDisplayType;
        },
        get FieldLayoutType() {
            return serverWidget.FieldLayoutType;
        },
        get FieldBreakType() {
            return serverWidget.FieldBreakType;
        },
        get SublistType() {
            return serverWidget.SublistType;
        },
        Form,
        Sublist,
        castForm(form) {
            return new Form(form);
        },
        createForm(options) {
            return serverWidget.createForm(options);
        }
    };
});