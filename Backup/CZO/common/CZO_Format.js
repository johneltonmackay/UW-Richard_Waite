define([
    'N/format'
], (ns_format) => {
    return {
        Type: ns_format.Type,
        Timezone: ns_format.Timezone,
        DateFormat: {
            STANDARD: 'YYYY-MM-DD'
        },
        format(options) {
            return ns_format.format(options);
        },
        parse(options) {
            return ns_format.parse(options);
        },
        leftPad(str, len, pad) {
            str = str ? str.trim() : '';
            len = len || 0;
            pad = pad || ' ';
            if (len + 1 >= str.length) {
                str = Array(len + 1 - str.length).join(pad) + str;
                // truncate on least significant digits (padded digits)
                if (str.length > len) {
                    str = str.substring(str.length - len, str.length);
                }
            } else {
                str = str.substring(str.length - len, str.length);
            }
            return str;
        },
        dateToString(date) {
            return ns_format.format({value: date, type: ns_format.Type.DATE});
        },
        stringToDate(dateString) {
            return ns_format.parse({value: dateString, type: ns_format.Type.DATE});
        },
        stringToDateTime(dateString) {
            return ns_format.parse({value: dateString, type: ns_format.Type.DATETIME});
        },
        dateToLocalDateString(date, timezone) {
            let strLocaleDate = ns_format.format({
                value: date,
                type: ns_format.Type.DATETIME,
                timezone: timezone
            });
            let dateElements = strLocaleDate.split(' ');
            return dateElements[0];
        },
        dateToLocalDate(date, timezone) {
            let strLocaleDate = this.dateToLocalDateString(date, timezone);
            let dateElements = strLocaleDate.split(' ');
            log.debug('strLocaleDate', strLocaleDate);
            return this.stringToDate(dateElements[0]);
        },
        dateToFormattedString(date, zeroPadded, dateFormat) {
            let me = this;
            let constMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            dateFormat = dateFormat || this.DateFormat.STANDARD;
            if (date && dateFormat) {
                return dateFormat.replace(/Y{2,4}|MM|Month|MONTH|D{2,3}/g, function (match) {
                    let replacement = '';
                    switch (match) {
                        case 'DD':
                            replacement = date.getDate();
                            break;
                        case 'Month':
                            replacement = constMonths[date.getMonth()];
                            break;
                        case 'MONTH':
                            replacement = constMonths[date.getMonth()].toUpperCase();
                            break;
                        case 'MM':
                            replacement = date.getMonth() + 1;
                            break;
                        case 'YY':
                        case 'YYYY':
                            replacement = date.getFullYear().toString().substr(-match.length);
                            break;
                    }
                    return zeroPadded ? me.leftPad(replacement.toString(), match.length, '0') : replacement;
                }) || '';
            }
            return '';
        },
        exceptionToString(ex, noStackTrace) {
            let exStr = '';
            if (ex) {
                if (ex instanceof Error) {
                    exStr += ex.toString() + '\n' + (noStackTrace ? ex.stack : '');
                } else if (ex.hasOwnProperty && ex.hasOwnProperty('recordId')) {
                    exStr += 'Event Type: ' + ex.eventType + '\n' + 'Record Id: ' + ex.recordId;
                } else {
                    let stackTrace = ex.stack;
                    if (stackTrace && stackTrace.join) {
                        stackTrace = stackTrace.join('\n');
                    }
                    exStr += ex.name + '\n' + ex.message + (stackTrace && !noStackTrace ? '\n' + stackTrace : '');
                }
            }
            return exStr;
        },
        floatToRounded(n, decimals) {
            decimals = decimals || 0;

            let precision = Math.pow(10, decimals);
            n = parseFloat((n * precision).toFixed(11));

            return Math.round(n) / precision;
        },
        floatToRoundedUp(n, decimals) {
            decimals = decimals || 0;

            let precision = Math.pow(10, decimals);
            n = parseFloat((n * precision).toFixed(11));

            return Math.ceil(n) / precision;
        },
        floatToRoundedDown(n, decimals) {
            decimals = decimals || 0;

            let precision = Math.pow(10, decimals);
            n = parseFloat((n * precision).toFixed(11));

            return Math.floor(n) / precision;
        },
        csvToJSONArray(csv) {
            let jsonArray = [];
            if (csv) {
                let csvLines = csv.split('\r\n');
                let header = csvLines[0];
                let keys = header.split(',');
                for (let i = 1, ii = csvLines.length; i < ii; i++) {
                    let csvLine = csvLines[i];
                    let values = csvLine.split(',');
                    let obj = {};
                    keys.forEach(function (key, j) {
                        obj[key] = values[j];
                    });
                    jsonArray.push(obj);
                }
            }

            return jsonArray;
        },
        arrayToSentence(arr, conjunction) {
            let nArr = [].concat(arr);
            let val = '';
            conjunction = conjunction || 'or';
            if (nArr.length > 0) {
                val += nArr[0] || '';
                if (nArr.length > 1) {
                    let lastElement = nArr.pop();
                    val = [nArr.join(', '), lastElement].join([' ', ' '].join(conjunction));
                }
            }
            return val;
        },
        floatToCurrency(value) {
            return ns_format.format({value: Number(value), type: ns_format.Type.CURRENCY});
        },
        arrayToCSVString(array, separator) {
            separator = separator || ',';
            return (array.map(function (line) {
                return line.join(separator);
            })).join('\n');
            ;
        },
        stringToChunks(str, length) {
            let chunks = [];
            for (let offset = 0, strLen = str.length; offset < strLen; offset += length) {
                chunks.push(str.slice(offset, length + offset));
            }
            return chunks;
        }
    };
});