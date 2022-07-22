const express = require("express");
const slugify = require("slugify");
let db = require("../db");
const ExpressError = require("../expressError");
const router = new express.Router();

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT i.code, i.name, c.code as "company code" FROM industries as i INNER JOIN comp_ind as ci ON i.code = ind_code INNER JOIN companies as c on comp_code = c.code`);
        return res.json({ industries: results.rows });
    } catch (e) {
        return next(e);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { name } = req.body;
        const code = slugify(name);
        const results = await db.query(
            `INSERT INTO industries (code, name)
            VALUES ($1, $2)
            RETURNING code, name`,
            [code, name]
        );
        return res.status(201).json({ industry: results.rows[0] });
    } catch (e) {
        next(e);
    }
});

router.post("/:ind_code", async (req, res, next) => {
    try {
        const { ind_code } = req.params;
        const { comp_code } = req.body;
        const results = await db.query(
            `INSERT INTO comp_ind (comp_code, ind_code)
            VALUES ($1, $2)
            RETURNING comp_code, ind_code`,
            [comp_code, ind_code]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Could not find industry with code ${ind_code}`, 404);
        };
        return res.json({ "new association": results.rows[0] });
    } catch (e) {
        next(e);
    }
});

router.put("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name } = req.body;
        const results = await db.query(
            `UPDATE industries SET name = $1
            WHERE code = $2
            RETURNING code, name`,
            [name, code]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`No industry found with code ${code}`, 404);
        }
        return res.json({ industry: results.rows[0] });
    } catch (e) {
        next(e);
    }
});

router.delete("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query(
            `DELETE FROM industries WHERE code = $1`,
            [code]
        );
        return res.json({ status: "deleted" });
    } catch (e) {
        next(e);
    }
});


module.exports = router;