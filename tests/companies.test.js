process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

const testCompany = {
    code: "testco",
    name: "Test Company",
    description: "This is a test company"
}
let testResponse;

beforeEach(async () => {
    let result = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING code, name`,
        [testCompany.code, testCompany.name, testCompany.description]
    );
    testResponse = result.rows[0]
});
afterEach(async () => {
    await db.query(`DELETE FROM companies`);
});
afterAll( async () => {
    await db.end();
});

describe("GET /companies", () => {
    test("Get a list of all companies", async () => {
        const response = await request(app).get('/companies');

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            companies: [testResponse]
        });
    });
});