const request = require("supertest");
const express = require("express");
const { Pool } = require("pg");
const app = require("./postgres"); // Assuming the app is exported from postgres.js

jest.mock("pg", () => {
    const mClient = {
        query: jest.fn(),
        end: jest.fn(),
    };
    const mPool = {
        query: jest.fn(),
        connect: jest.fn(() => mClient),
        end: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

describe("GET /speedgraph", () => {
    let pool;

    beforeAll(() => {
        pool = new Pool();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if vehicle_id or datetime is missing", async () => {
        const response = await request(app).get("/speedgraph").query({});
        expect(response.status).toBe(400);
        expect(response.text).toBe("vehicle_id and date are required");
    });

    it("should return 400 if query parameters are invalid", async () => {
        const response = await request(app)
            .get("/speedgraph")
            .query({ vehicle_id: "abc", datetime: "invalid-date" });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

    it("should return 500 if there is a database error", async () => {
        pool.query.mockRejectedValueOnce(new Error("Database error"));
        const response = await request(app)
            .get("/speedgraph")
            .query({ vehicle_id: "1", datetime: "2024-06-06 12:00:00" });
        expect(response.status).toBe(500);
        expect(response.text).toBe("Internal Server Error");
    });

    it("should return 200 and query results if valid parameters are provided", async () => {
        const mockRows = [{ speed: 50, time: "2024-06-06 12:00:00" }];
        pool.query.mockResolvedValueOnce({ rows: mockRows });

        const response = await request(app)
            .get("/speedgraph")
            .query({ vehicle_id: "1", datetime: "2024-06-06 12:00:00" });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockRows);
    });
});