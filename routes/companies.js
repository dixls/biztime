const express = require("express");
const slugify = require("slugify");
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

router.get("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query(
            `SELECT c.code, c.name, c.description, i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, ind.name 
            FROM companies as c
            INNER JOIN invoices as i ON c.code = i.comp_code
            INNER JOIN comp_ind as ci ON c.code = ci.comp_code
            INNER JOIN industries as ind ON ci.ind_code = ind.code
            WHERE code = "$1"`,
            [code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`No company found with code: ${code}`, 404);
        };
        const data = results.rows[0];
        const company = {
            code: data.code,
            name: data.name,
            description: data.description,
            invoices: {
                id: data.id,
                amt: data.amt,
                paid: data.paid,
                add_date: data.add_date,
                paid_data: data.paid_data
            },
            industries: {
                name: data.ind.name
            }
        };
        return res.json({ "company": company });
    } catch (e) {
        return next(e);
    }
});

router.post("/", async (res, res, next) => {
    try {
        const { name, description } = req.body;
        const code = slugify(name);
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

router.put("/:code", async (req, res, next) => {
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

router.delete("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query(
            `DELETE FROM companies WHERE code = $1`,
            [code]
        );
        return res.json({ status: "deleted" });
    } catch (e) {
        next(e);
    }
});


module.exports = router;