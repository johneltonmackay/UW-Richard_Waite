define([
    'N/record'
], (record) => {
    class Record {
        constructor(record) {
            this.record = record;
            this.id = record.id || '';
            this.type = record.type;
        }

        get fields() {
            return this.record.getFields();
        };

        getField(options) {
            return this.record.getField(options);
        };

        getValue(options) {
            return this.record.getValue(options);
        };

        getText(options) {
            return this.record.getText(options);
        };

        setText(options) {
            this.record.setText(options);
        };

        setValue(options) {
            this.record.setValue(options);
        };

        getLineCount(options) {
            return this.record.getLineCount(options);
        };

        insertLine(options) {
            this.record.insertLine(options);
        };

        removeLine(options) {
            this.record.removeLine(options);
        };

        selectLine(options) {
            this.record.selectLine(options);
        };

        selectNewLine(options) {
            this.record.selectNewLine(options);
        };

        commitLine(options) {
            this.record.commitLine(options);
        };

        findSublistLineWithValue(options) {
            return this.record.findSublistLineWithValue(options);
        };

        getCurrentSublistValue(options) {
            return this.record.getCurrentSublistValue(options);
        };

        getCurrentSublistText(options) {
            return this.record.getCurrentSublistText(options);
        };

        getCurrentSublistIndex(options) {
            return this.record.getCurrentSublistIndex(options);
        };

        getSublistValue(options) {
            return this.record.getSublistValue(options);
        };

        getSublistText(options) {
            return this.record.getSublistText(options);
        };

        getSublistField(options) {
            return this.record.getSublistField(options);
        };

        getSublistFields(options) {
            return this.record.getSublistFields(options);
        };

        getSublistSubrecord(options) {
            return this.record.getSublistSubrecord(options);
        };

        getSubrecord(options) {
            return this.record.getSubrecord(options);
        };

        setSublistValue(options) {
            this.record.setSublistValue(options);
        };

        setSublistText(options) {
            this.record.setSublistText(options);
        };

        setCurrentSublistValue(options) {
            this.record.setCurrentSublistValue(options);
        };

        setCurrentSublistText(options) {
            this.record.setCurrentSublistText(options);
        };

        save(options) {
            this.id = this.record.save(options);
            return this.id;
        };

        getValues(options) {
            let me = this;
            let values = {};
            Object.keys(options.keyFieldIdMap).forEach((key) => {
                let fieldId = options.keyFieldIdMap[key];
                if (fieldId) {
                    values[key] = key.indexOf('Text') > -1 ? me.getText({fieldId: fieldId}) : me.getValue({fieldId: fieldId});
                }
            });
            return values;
        };

        setValues(options) {
            let me = this;
            Object.keys(options.values).forEach((key) => {
                let value = options.values[key];
                let fieldId = options.keyFieldIdMap ? options.keyFieldIdMap[key] : key;
                if (fieldId) {
                    let setOptions = {fieldId: options.keyFieldIdMap ? options.keyFieldIdMap[key] : key};
                    if (key.indexOf('Text') > -1) {
                        setOptions.text = value;
                        me.setText(setOptions)
                    } else {
                        setOptions.value = value;
                        me.setValue(setOptions);
                    }
                }
            });
        };

        setCurrentSublistValues(options) {
            let me = this;
            let sublistId = options.sublistId;
            let keyFieldIdMap = options.keyFieldIdMap;
            let fieldValues = options.fieldValues;
            let line = options.line;
            this.selectLine({sublistId: sublistId, line: line});
            Object.keys(fieldValues).forEach((key) => {
                let fieldId = keyFieldIdMap[key];
                let value = fieldValues[key];
                if (fieldId) {
                    me.setCurrentSublistValue({sublistId: sublistId, fieldId: fieldId, value: value});
                }
            });
            this.commitLine({sublistId: sublistId});
        };

        setSublistValues(options) {
            let me = this;
            let sublistId = options.sublistId;
            let keyFieldIdMap = options.keyFieldIdMap;
            let fieldValues = options.fieldValues;
            let line = options.line;
            Object.keys(fieldValues).forEach((key) => {
                let fieldId = keyFieldIdMap[key];
                let value = fieldValues[key];
                if (fieldId) {
                    me.setSublistValue({sublistId: sublistId, fieldId: fieldId, value: value, line: line});
                }
            });
        };

        getSublistLine(options) {
            let me = this;
            let sublistLine = {};
            let sublistId = options.sublistId;
            let line = options.line;
            let keyFieldIdMap = options.keyFieldIdMap;
            Object.keys(keyFieldIdMap).forEach((key) => {
                let fieldId = keyFieldIdMap[key];
                if (fieldId) {
                    let options = {sublistId: sublistId, fieldId: fieldId, line: line};
                    sublistLine[key] = key.indexOf('Text') > -1 ? me.getSublistText(options) : me.getSublistValue(options);
                }
            });

            return sublistLine;
        };

        getSublistLines(options) {
            let sublistId = options.sublistId;
            let keyFieldIdMap = options.keyFieldIdMap;
            let sublistLines = [];
            let lineCount = this.getLineCount({sublistId: sublistId});
            for (let line = 0; line < lineCount; line++) {
                sublistLines.push(this.getSublistLine({sublistId: sublistId, keyFieldIdMap: keyFieldIdMap, line: line}));
            }

            return sublistLines;
        };

        addSublistLines(options) {
            let me = this;
            let sublistId = options.sublistId;
            let keyFieldIdMap = options.keyFieldIdMap;
            let lines = options.lines;
            lines.forEach((line) => {
                me.selectNewLine({sublistId: sublistId});
                Object.keys(line).forEach((lineKey) => {
                    let value = line[lineKey] == null ? '' : line[lineKey];
                    let fieldId = keyFieldIdMap[lineKey];
                    if (fieldId) {
                        let setOptions = {sublistId: sublistId, fieldId: fieldId, value: value};
                        if (lineKey.indexOf('Text') > -1) {
                            setOptions.text = value;
                            me.setCurrentSublistText(setOptions)
                        } else {
                            setOptions.value = value;
                            me.setCurrentSublistValue(setOptions);
                        }
                    }
                });
                me.commitLine({sublistId: sublistId});
            });
        };

        removeSublistLines(options) {
            let me = this;
            let sublistId = options.sublistId;
            let lineCount = this.getLineCount({sublistId: sublistId});
            for (let i = 0; i < lineCount; i++) {
                me.removeLine({sublistId: sublistId, line: 0});
            }
        };

        toJSON() {
            return this.record.toJSON();
        }
    };

    return {
        get Type() {
            return record.Type;
        },
        Record,
        submitFields(options) {
            return record.submitFields(options);
        },
        create(options) {
            return record.create(options);
        },
        load(options) {
            return record.load(options);
        },
        copy(options) {
            return record.copy(options);
        },
        transform(options) {
            return record.transform(options);
        },
        delete(options) {
            return record.delete(options);
        },
        cast(record) {
            return new Record({record: record});
        },
        promisedLoad(options) {
            return record.load.promise(options);
        }
    };
});