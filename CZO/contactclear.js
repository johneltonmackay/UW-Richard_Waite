    var count = record.getLineCount({‌

      sublistId: "contacts"

    });

    for (var i = 0; i <= count; i++) {‌

      record.removeLine({‌

        sublistId: "contacts",

        line: i

      });

    }