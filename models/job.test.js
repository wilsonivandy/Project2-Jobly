"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", function () {
    let newJob = {
      companyHandle: "c1",
      title: "job-test",
      salary: 100,
      equity: "0.1",
    };
  
    test("works", async function () {
      let job = await Job.create(newJob);
      expect(job).toEqual({
        ...newJob,
        id: expect.any(Number),
      });
    });
  });

describe("find all", function () {
    test("get all jobs unfiltered", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {"companyHandle": "c1", "companyName": "C1", "equity": "0.1", "id": testJobIds[0], "salary": 100, "title": "Job1", }, 
            {"companyHandle": "c1", "companyName": "C1", "equity": "0.2", "id": testJobIds[1], "salary": 200, "title": "Job2"}, 
            {"companyHandle": "c1", "companyName": "C1", "equity": "0", "id": testJobIds[2], "salary": 300, "title": "Job3"}, 
            {"companyHandle": "c1", "companyName": "C1", "equity": null, "id": testJobIds[3], "salary": null, "title": "Job4"}])
    });

    test("get all jobs filter: Salary greater than 150", async function () {
        let jobs = await Job.findAll({minSalary: 150});
        expect(jobs).toEqual([
            {"companyHandle": "c1", "companyName": "C1", "equity": "0.2", "id": testJobIds[1], "salary": 200, "title": "Job2"}, 
            {"companyHandle": "c1", "companyName": "C1", "equity": "0", "id": testJobIds[2], "salary": 300, "title": "Job3"},
        ])
    })
})

describe("get", function () {
    test("get job by id", async function () {
        let job = await Job.get(testJobIds[1]);
        expect(job).toEqual({
            "companyHandle": "c1", 
            "equity": "0.2", 
            "id": testJobIds[1], 
            "salary": 200, 
            "title": "Job2", 
            company: {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
            }
        })
    });

    test("get non-existing job by id", async function () {
        try {
            await Job.get(0);
            fail();
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        };
    })
})

describe("update", function () {
    let updateData = {
        title: "New",
        salary: 500,
        equity: "0.5",
      };
    test("update existing job by id", async function () {
        let job = await Job.update(testJobIds[0], updateData);
        expect(job).toEqual({
            id: testJobIds[0],
            companyHandle: "c1",
            ...updateData,
        })
    });

    test("update existing job by id with bad data", async function () {
        try {
            await Job.update(testJobIds[0], {});
            fail()
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    test("update non-existing job by id", async function () {
        try {
            await Job.update(0, updateData);
            fail()
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })
})

describe("remove", function () {
    test("remove existing job by id", async function () {
        let job = await Job.remove(testJobIds[0]);
        const res = await db.query(
            "SELECT id FROM jobs WHERE id=$1", [testJobIds[0]]);
        expect(res.rows.length).toEqual(0);
    });

    test("remove non-existing job by id", async function () {
        try {
            await Job.remove(0);
            fail()
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })
})