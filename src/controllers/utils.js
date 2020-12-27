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
module.exports = {
    addProfileClause,
    validateDateFormat,
}