const express = require("express");
let db = require("../db");
const ExpressError = require("../expressError");
const router = new express.Router();

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(
            `SELECT * FROM invoices`
        );
        return res.json({ invoices: results.rows });
    } catch (e) {
        next(e);
    }
})

router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(
            `SELECT id, comp_code, amt, paid, add_date, paid_date, code, name, description FROM invoices
            INNER JOIN companies ON comp_code=code
            WHERE id = '$1'`,
            [id]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Couldn't find invoice with id of ${id}`, 404);
        }
        const data = results.rows[0];
        const invoice = {
            id: data.id,
            comp_code: data.comp_code,
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date,
            company: {
                code: data.code,
                name: data.name,
                description: data.description
            }
        }
        return res.json({ "invoice": invoice })
    } catch (e) {
        next(e);
    }
})


router.post("/", async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query(
            `INSERT INTO invoices (comp_code, amt, paid)
            VALUES ($1, $2, false)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt]
        );
        return res.json({ invoice: results.rows[0] })
    } catch (e) {
        next(e);
    }
})

router.put("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt } = req.body;
        const results = await db.query(
            `UPDATE invoices SET amt = $1
            WHERE id = $2
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, id]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Couldn't find invoice with id of ${id}`, 404);
        }
        return res.json({ invoice: results.rows[0] });
    } catch (e) {
        next(e);
    }
})

router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(
            `DELETE FROM invoices WHERE id = $1`, [id]
        );
        return res.json({ status: "deleted" });
    } catch (e) {
        next(e);
    }
})

module.exports = router;