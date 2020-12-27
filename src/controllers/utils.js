const moment = require('moment');
const addProfileClause = (whereObj, profileType, profileId) => {
    switch (profileType) {
        case 'client':
            whereObj.ClientId = profileId;
            break;
        case 'contractor':
            whereObj.ContractorId = profileId;
            break;
        default:
            whereObj = null;
            break;
    }
    return whereObj;
}

const validateDateFormat = (date, format) => {
    return moment(date, format, true).isValid();
}
/**
 * 
 * @param {array} profilesWithJobs Array with sequelize instance of profiles 
 * with corresponding contract and with corresponding jobs
 */
const getEarnedMost = (profilesWithJobs) => {
    const professions = {};
    let earnedMost = {prof:'No profession in time range..', value:0};
    profilesWithJobs.forEach((profile) => {
        if(!Object.keys(professions).includes(profile.profession)){
            professions[profile.profession] = 0;
        }
        profile.Contractor.forEach((contractor) => {
            contractor.Jobs.forEach((job)=> {
                professions[profile.profession] += job.price;
            });
        });
        if(professions[profile.profession] > earnedMost.value){
            earnedMost.value = professions[profile.profession];
            earnedMost.prof = profile.profession;
        } 
    });
    return {professions, earnedMost};
}

const getBestClient = (clientsWithJobs, limit=2) => {
    let clientsJobs = [];
    clientsWithJobs.forEach((client) => {
        client.Client.forEach((contract) => {
            contract.Jobs.forEach((job) => {
                clientsJobs.push({
                    id: job.id,
                    fullName: `${client.firstName} ${client.lastName}`,
                    paid: job.price,
                })
            })
        })
    })

    clientsJobs.sort((a,b) => (b.paid - a.paid));
    return clientsJobs.slice(0, limit);
}

module.exports = {
    addProfileClause,
    validateDateFormat,
    getEarnedMost,
    getBestClient,
}