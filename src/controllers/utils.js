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

module.exports = {
    addProfileClause,
}