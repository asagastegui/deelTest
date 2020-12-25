const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model');
const {getProfile} = require('./middleware/getProfile');
const { getWhereClause, getWhereAllNoTerm, getWhereAllActive } = require('./controllers/Contracts');
const app = express();
const { QueryTypes } = require("sequelize");
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

/**
 * FIX ME!
 * @returns contract by id
 */
app.get('/contracts/:id',getProfile ,async (req, res) =>{
    const {Contract} = req.app.get('models')
    const {id} = req.params
    const whereClause = getWhereClause(id, req.profile.type , req.profile.id);
    if(!whereClause) return res.status(404).end();
    const contract = await Contract.findOne({where:whereClause});
    if(!contract) return res.status(404).end()
    res.json(contract)
})

app.get('/contracts', getProfile, async (req, res) => {
    const {Contract} = req.app.get('models')
    const whereClause = getWhereAllNoTerm(req.profile.type , req.profile.id);
    if(!whereClause) return res.status(404).end();
    const contract = await Contract.findAll({where:whereClause});
    if(!contract) return res.status(404).end()
    res.json(contract)
});

app.get('/jobs/unpaid', getProfile, async (req, res) => {
    const {Contract, Job} = req.app.get('models')
    const contractWhere = getWhereAllActive(req.profile.type , req.profile.id);
    if(!contractWhere) return res.status(404).end();
    const jobs = await Job.findAll({where:{paid: null}, include: [{model: Contract, where: contractWhere}]});
    if(!jobs) return res.status(404).end()
    res.json(jobs)
});

app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
    // idk if  i should change the contract status when all jobs are paid.. 
    // instructions didnt say anything
    const {Job, Profile, Contract} = req.app.get('models');
    const {job_id} = req.params
    const job = await Job.findOne({where:{id: job_id, paid:null}});
    const contract = await Contract.findOne({include: [{model:Job, where: {id: job_id}}]});
    // if the job doesnt belong to the client, then shouldnt pay for it.
    if(contract.ClientId !== req.profile.id) return res.status(404).end();
    const contractor = await Profile.findOne({where: {id: contract.ContractorId}});
    if(!job || !contract || !contractor) return res.status(404).end();
    // Check if have enought money to pay..
    if(req.profile.balance >= job.price ) {
        job.paid = 1;
        job.paymentDate = new Date();
        await job.save();
        req.profile.balance = req.profile.balance - job.price;
        await req.profile.save();
        contractor.balance += job.price;
        await contractor.save();
    }
    res.json({"paid_out": true});
});

// ASuming the amount to deposit its on the body in the attribute "amount"
app.post('/balances/deposit/:user_id', getProfile, async (req, res) => {
    const {user_id} = req.params;
    const {amount} = req.body;    
    const {Job, Profile, Contract} = req.app.get('models');
    const jobsPendingSum = await Job.sum('price', {where:{paid:null}, include: [{model:Contract, where: {ClientId: req.profile.id}}]});
    // if amount to deposit is greater than 25 % of pending jobs to pay
    // cant deposit
    if(amount > (jobsPendingSum * .25)) {
        return res.status(404).end();
    } 
    const userToDeposit = await Profile.findOne({where: {id: user_id}});
    if(!userToDeposit) return res.status(404).end();
    userToDeposit.balance += amount;
    await userToDeposit.save();
    res.json({"deposit_success": true});
});

// Asuming the date will be formated YYYY/MM/DD
app.get('/admin/best-profession', getProfile, async (req, res) => {
    const {start, end} = req.query;
    const earnedMost = await req.app.get('sequelize').query(`select max(ganancia), profession from (select sum(price) ganancia, profession
    from (select * from jobs
        where paymentDate >= :startDate and paymentDate <= :endDate
        ) Jobs
        join Contracts C on Jobs.ContractId = C.id
        join Profiles P on C.ContractorId = P.id
    where 1=1
        and paid IS NOT NUll
    group by p.profession)`, {
        replacements: {
            startDate: start,
            endDate: end,
        },
        type: QueryTypes.SELECT
    });
    res.json({"profession": earnedMost[0].profession});
});

app.get('/admin/best-clients', getProfile, async (req, res) => {
    const {start, end, limit=2} = req.query;
    const bestClients = await req.app.get('sequelize').query(`select Jobs.id id,price paid, p.firstName || ' ' || p.lastName fullName
    from (select * from jobs
        where paymentDate >= :startDate and paymentDate <= :endDate
        ) Jobs
        join Contracts C on Jobs.ContractId = C.id
        join Profiles P on C.ClientId = P.id
    where 1=1
        and paid IS NOT NUll
    order by price desc
    limit :limit`, {
        replacements: {
            startDate: start,
            endDate: end,
            limit
        },
        type: QueryTypes.SELECT
    });
    res.json(bestClients);
});


module.exports = app;
