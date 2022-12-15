const { sqlForPartialUpdate } = require("./sql");

describe("Update Partial SQL", function () {
    test("Valid data", function () {
        const result = sqlForPartialUpdate(
            { a: "data1" },
            { a: "data0", b: "data2" });
        expect(result).toEqual({
          setCols: "\"data0\"=$1",
          values: ["data1"],
        });
    });
  });
  