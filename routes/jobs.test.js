"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /jobs", function() {
    test("ok for admin", async function() {
        const resp = await request(app)
                .post(`/jobs`)
                .send({
                    companyHandle: "c1",
                    title: "jobTitle-C1",
                    salary: 50,
                    equity: "0.1",
                })
                .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                companyHandle: "c1",
                title: "jobTitle-C1",
                salary: 50,
                equity: "0.1",
            }
        });
    });

    test("unauthorized for non-admin", async function() {
        const resp = await request(app)
                .post(`/jobs`)
                .send({
                    companyHandle: "c1",
                    title: "jobTitle-C1",
                    salary: 50,
                    equity: "0.1",
                })
                .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });
})

describe("GET /jobs", function() {
    const expectedResult = {
        jobs: [
          {
            id: expect.any(Number),
            title: "J1",
            salary: 1,
            equity: "0.1",
            companyHandle: "c1",
            companyName: "C1",
          },
          {
            id: expect.any(Number),
            title: "J2",
            salary: 2,
            equity: "0.2",
            companyHandle: "c1",
            companyName: "C1",
          },
          {
            id: expect.any(Number),
            title: "J3",
            salary: 3,
            equity: null,
            companyHandle: "c1",
            companyName: "C1",
          },
        ]
      };
    test("ok for admin", async function() {
        const resp = await request(app)
                .get(`/jobs`)
                .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expectedResult);
    });

    test("ok for non-admin", async function() {
        const resp = await request(app)
                .get(`/jobs`)
                .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expectedResult);
    });
})

describe("GET /jobs/:id", function() {
    const expectedResult = {
        job: {
          id: expect.any(Number),
          title: "J1",
          salary: 1,
          equity: "0.1",
          company: {
            handle: "c1",
            name: "C1",
            description: "Desc1",
            numEmployees: 1,
            logoUrl: "http://c1.img",
          },
        },
      };
    test("ok for admin", async function() {
        const resp = await request(app)
                .get(`/jobs/${testJobIds[0]}`)
                .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expectedResult);
    });

    test("ok for non-admin", async function() {
        const resp = await request(app)
                .get(`/jobs/${testJobIds[0]}`)
                .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expectedResult);
    });
})

describe("PATCH /jobs/:id", function() {
    const expectedResult = {
        job:  {
                 companyHandle: "c1",
                 equity: "0.1",
                 id: expect.any(Number),
                 salary: 1,
                 title: "J1-New",
               },
        
      };
    test("ok for admin", async function() {
        const resp = await request(app)
                .patch(`/jobs/${testJobIds[0]}`)
                .send({
                    title: "J1-New",
                  })
                .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual(expectedResult);
    });

    test("not ok for non-admin", async function() {
        const resp = await request(app)
                .patch(`/jobs/${testJobIds[0]}`)
                .send({
                    handle: "new",
                  })
                .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });
})

describe("DELETE /jobs/:id", function() {
    test("ok for admin", async function() {
        const resp = await request(app)
                .delete(`/jobs/${testJobIds[0]}`)
                .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({ deleted: testJobIds[0] });
    });

    test("not ok for non-admin", async function() {
        const resp = await request(app)
                .delete(`/jobs/${testJobIds[0]}`)
                .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });
})