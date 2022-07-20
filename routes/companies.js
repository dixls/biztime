const express = require("express");
let db = require("../db");
const ExpressError = require("../expressError");
const router = new express.Router();

router.get("/", (req, res) => {
    try {
        const results = await db.query('SELECT code, name FROM companies');
        return res.json({ companies: results.rows });
    } catch (e) {
        return next(e);
    }
});

router.get("/:code", (req, res) => {
    try {
        const { code } = req.params;
        const results = await db.query('SELECT code, name, description FROM companies WHERE code = "$1"', [code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`No company found with code: ${code}`, 404);
        }
        return res.json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.post("/", (res, res) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
            [code, name, description]
        );
        return res.status(201).json({ company: results.rows[0] });
    } catch (e) {
        next(e)
    }
});

router.put("/:code", (req, res) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query(
            `UPDATE companies SET name = $1, description = $2
            WHERE code = $3
            RETURNING code, name, description`,
            [name, description, code]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`No company found with code ${code}`, 404);
        }
        return res.json({ company: results.rows[0] });
    } catch (e) {
        next(e);
    }
});

router.delete("/:code", (req, res) => {
    try {
        const { code } = req.params;
        const results = await db.query(
            `DELETE FROM comppanies WHERE code = $1`,
            [code]
        );
        return res.json({ status: "deleted" });
    } catch (e) {
        next(e);
    }
});


module.exports = router;