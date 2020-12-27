/**
 * @description Get the where clause to query DB (using sequelize) in order to get
 *              unpaid jobs.
 * @returns {object} returns an object with the status not terminated and either
 * with the clientId or ContractorId based on the profile type. Null if other type
 * of profile type. {paid: null}
 *
 */
const getWhereUnpaid = () => {
    return {paid: null}
};
/**
 * @description Get the instances involved with the transaction to pay a job
 * @param {number} jobId Job Identifier
 * @param {number} profileId Profile Identifier of the logged user
 * @param {object} models An object with the sequelize models of Job, Contract, and Profile
 * @returns {promise} object containing the instances of the job and contractor 
 * related with the transaction, null if something break or not found
 */
const getInstancesRelated = async (jobId, profileId, models) => {
    try {
        const {Job, Contract, Profile} = models;
        const job = await Job.findOne({where:{id: jobId, paid:null}});
        const contract = await Contract.findOne({include: [{model:Job, where: {id: jobId}}]});
        // if the job doesnt belong to the client, then shouldnt pay for it.
        if(contract.ClientId !== profileId) return null;
        const contractor = await Profile.findOne({where: {id: contract.ContractorId}});
        if(!job || !contractor) return null;
        return {job, contractor};
    } catch (err) {
        console.log(err);
        return null;
    }
}
/**
 * 
 * @param {object} instances sequelize instances of job, contractor(profile), 
 * client(profile) involved with the transaction
 * @returns {promise} Promise reoslving on Boolean depending if the transaction was made
 */
const makePayJobTransaction = async ({job, contractor, client}) => {
    if(!job || !contractor || !client) return false;
    // Check if have enought money to pay..
    if(client.balance >= job.price ) {
        job.paid = 1;
        job.paymentDate = new Date();
        await job.save();
        client.balance = client.balance - job.price;
        await client.save();
        contractor.balance += job.price;
        await contractor.save();
    } else {
        console.log("Not enought money..");
        return false;
    }
    return true;
}

/**
 * @description Get the pending sum of a client jobs (that are not paid)
 * @param {number} clientId Profile Identifier of the logged user
 * @param {object} models An object with the sequelize models of Job, Contract
 * @returns {promise} Promise resolving in number with the sum of the unpaid jobs.
 */
const getJobsPendingSum = async(models, clientId) => {
    try{
        const { Job, Contract} = models;
        const jobsPendingSum = await Job.sum("price", {
            where: { paid: null },
            include: [{ model: Contract, where: { ClientId: clientId } }],
        });
        return jobsPendingSum;
    } catch (err) {
        console.log(err);
        return null;
    }
}

module.exports = {
    getWhereUnpaid,
    getInstancesRelated,
    makePayJobTransaction,
    getJobsPendingSum,
};