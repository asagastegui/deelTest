const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");
const { Op } = require("sequelize");
const { getProfile } = require("./middleware/getProfile");
const {
  getWhereClause,
  getWhereAllNoTerm,
  getWhereAllActive,
} = require("./controllers/Contracts");
const {
  getWhereUnpaid,
  getInstancesRelated,
  makePayJobTransaction,
  getJobsPendingSum,
} = require("./controllers/Jobs");
const {
  validateDateFormat,
  getEarnedMost,
  getBestClient,
} = require("./controllers/utils");
const { canMakeDeposit, makeDepositToUser } = require("./controllers/Profile");

const app = express();
const { QueryTypes } = require("sequelize");
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

/**
 * It took me 2 hours more (done in different day) to complete the unit tests because i had to refactor the code :p
 * also, i think some endpoints that only do queries should be better tested with using
 * the actual DB and the test data
 * (cleaning the DB and then starting the server in order to make actual requests),
 * because those endpoints only make requests (all the "logic" are embebed into the query)
 * (becase is faster filter using the query than after the query do some filter)
 */

/**
 * @returns contract by id
 */
app.get("/contracts/:id", getProfile, async (req, res) => {
  try {
    const { Contract } = req.app.get("models");
    const { id } = req.params;
    const whereClause = getWhereClause(id, req.profile.type, req.profile.id);
    if (!whereClause) return res.status(404).end();
    const contract = await Contract.findOne({ where: whereClause });
    if (!contract) return res.status(404).end();
    res.json(contract);
  } catch (err) {
    console.log(err);
    return res.status(404).end();
  }
});
/**
 * @returns All contracts that are not terminated and belongs to the logged profile
 */
app.get("/contracts", getProfile, async (req, res) => {
  try {
    const { Contract } = req.app.get("models");
    const whereClause = getWhereAllNoTerm(req.profile.type, req.profile.id);
    if (!whereClause) return res.status(404).end();
    const contract = await Contract.findAll({ where: whereClause });
    if (!contract) return res.status(404).end();
    res.json(contract);
  } catch (err) {
    console.log(err);
    return res.status(404).end();
  }
});
/**
 * @returns All the unpaid jobs that belong to the logged profile
 */
app.get("/jobs/unpaid", getProfile, async (req, res) => {
  try {
    const { Contract, Job } = req.app.get("models");
    const contractWhere = getWhereAllActive(req.profile.type, req.profile.id);
    const jobWhere = getWhereUnpaid();
    if (!contractWhere || !jobWhere) return res.status(404).end();
    const jobs = await Job.findAll({
      where: jobWhere,
      include: [{ model: Contract, where: contractWhere }],
    });
    if (!jobs) return res.status(404).end();
    res.json(jobs);
  } catch (err) {
    console.log(err);
    return res.status(404).end();
  }
});

app.post("/jobs/:job_id/pay", getProfile, async (req, res) => {
  try {
    const { Job, Profile, Contract } = req.app.get("models");
    const { job_id } = req.params;
    const instances = await getInstancesRelated(job_id, req.profile.id, {
      Job,
      Contract,
      Profile,
    });
    let payed = false;
    if (instances) {
      payed = await makePayJobTransaction({
        client: req.profile,
        ...instances,
      });
    } else {
      return res.status(404).end();
    }
    res.json({ paid_out: payed });
  } catch (err) {
    console.log(err);
    return res.status(404).end();
  }
});

// ASuming the amount to deposit its on the body in the attribute "amount"
app.post("/balances/deposit/:user_id", getProfile, async (req, res) => {
  try {
    // based on what i know im assuming a deposit is different than a trasnfer (deposit)
    // is when you go to the bank with physical money, transfer is when you move funds from
    // your account directly to another account
    const { user_id } = req.params;
    const { amount } = req.body;
    const { Job, Profile, Contract } = req.app.get("models");
    const jobsPendingSum = await getJobsPendingSum(
      { Job, Contract },
      req.profile.id
    );
    let depositMaked = false;
    if (canMakeDeposit(jobsPendingSum, amount)) {
      depositMaked = await makeDepositToUser(amount, user_id, { Profile });
    }
    res.json({ deposit_success: depositMaked });
  } catch (err) {
    console.log(err);
    return res.status(404).end();
  }
});

// Asuming the date will be formated YYYY-MM-DD
app.get("/admin/best-profession", getProfile, async (req, res) => {
  try {
    const { start, end } = req.query;
    const { Job, Profile, Contract } = req.app.get("models");
    if (
      !validateDateFormat(start, "YYYY-MM-DD") ||
      !validateDateFormat(end, "YYYY-MM-DD")
    ) {
      return res.status(404).end();
    }
    const profilesWithJobs = await Profile.findAll({
      where: { type: "contractor" },
      include: [
        {
          model: Contract,
          as: "Contractor",
          include: [
            {
              model: Job,
              where: {
                paid: 1,
                paymentDate: {
                  [Op.gte]: start,
                  [Op.lte]: end,
                },
              },
            },
          ],
        },
      ],
    });
    const result = getEarnedMost(profilesWithJobs);
    res.json({ profession: result.earnedMost.prof });
  } catch (err) {
    console.log(err);
    return res.status(404).end();
  }
});

app.get("/admin/best-clients", getProfile, async (req, res) => {
  try {
    const { start, end, limit = 2 } = req.query;
    const { Job, Profile, Contract } = req.app.get("models");
    if (
      !validateDateFormat(start, "YYYY-MM-DD") ||
      !validateDateFormat(end, "YYYY-MM-DD")
    ) {
      return res.status(404).end();
    }
    const clientsWithJobs = await Profile.findAll({
      where: { type: "client" },
      include: [{
          model: Contract,
          as: "Client",
          include: [{
              model: Job,
              where: {
                paid: 1,
                paymentDate: {
                  [Op.gte]: start,
                  [Op.lte]: end,
                },
              },
          }],
      }],
    });
    const bestClient = getBestClient(clientsWithJobs, limit);
    res.json(bestClient);
  } catch (err) {
    console.log(err);
    return res.status(404).end();
  }
});
module.exports = app;
