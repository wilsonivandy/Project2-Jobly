const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = express.Router({ mergeParams: true });

/** POST: Create Job
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: is admin
 */

 router.post("/", ensureAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
      const job = await Job.create(req.body);
      return res.status(201).json({ job });
    } catch (err) {
      return next(err);
    }
});
  
  /** GET: all jobs { jobs: [ { id, title, salary, equity, company_handle }, ...] }
   *
   * Can filter on provided search filters:
   * - title
   * - salary
   * - equity
   * 
   * Authorization required: none
   */
  
router.get("/", async function (req, res, next) {
    try {
      const query = req.query
      if (query.salary) {
        query.salary = parseInt(query.salary);
      }
      if (query.equity) {
        query.equity = parseInt(query.equity);
      }
      const validator = jsonschema.validate(query, jobSearchSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
      const jobs = await Job.findAll(query);
      return res.json({ jobs });
    } catch (err) {
      return next(err);
    }
});
  
  /** GET job by id
   *
   *  Job is { id, title, salary, equity, company_handle }
   *
   * Authorization required: none
   */
  
  router.get("/:id", async function (req, res, next) {
    try {
      const job = await Job.get(req.params.id);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });
  
  /** PATCH job by id
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Authorization required: is admin
   */
  
  router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.update(req.params.id, req.body);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });
  
  /** DELETE job by id
   *
   * Authorization: is admin
   */
  
  router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
      await Job.remove(req.params.id);
      return res.json({ deleted: parseInt(req.params.id )});
    } catch (err) {
      return next(err);
    }
  });
  
  
  module.exports = router;
  