const { Op } = require("sequelize");
const { addProfileClause } = require("./utils");
/**
 * @description Get the where clause to query DB (using sequelize) based on the
 * type of the profile and contract id.
 * @param {number} contractId Contract Identifier
 * @param {('client'|'contractor')} profileType Type of the profile (could be client or contractor)
 * @param {number} profileId Profile identifier
 * @returns {object||null} returns an object with the id of contract and either
 * with the clientId or ContractorId based on the profile type. Null if other type
 * of profile type.
 *
 */
const getWhereClause = (contractId, profileType, profileId) => {
  let whereClause = addProfileClause(
    { id: contractId },
    profileType,
    profileId
  );
  return whereClause;
};

/**
 * @description Get the where clause to query DB (using sequelize) based on the
 * type of the profile and not terminated contracts.
 * @param {('client'|'contractor')} profileType Type of the profile.
 * @param {number} profileId Profile identifier
 * @returns {object||null} returns an object with the status not terminated and either
 * with the clientId or ContractorId based on the profile type. Null if other type
 * of profile type.
 *
 */
const getWhereAllNoTerm = (profileType, profileId) => {
  let whereClause = addProfileClause(
    { status: { [Op.not]: "terminated" } },
    profileType,
    profileId
  );
  return whereClause;
};
/**
 * @description Get the where clause to query DB (using sequelize) based on the
 * type of the profile and active contracts (status = in_progress).
 * @param {('client'|'contractor')} profileType Type of the profile.
 * @param {number} profileId Profile identifier
 * @returns {object||null} returns an object with the status not terminated and either
 * with the clientId or ContractorId based on the profile type. Null if other type
 * of profile type.
 *
 */
const getWhereAllActive = (profileType, profileId) => {
  let whereClause = addProfileClause(
    { status: "in_progress" },
    profileType,
    profileId
  );
  return whereClause;
};

module.exports = {
  getWhereClause,
  getWhereAllNoTerm,
  getWhereAllActive,
};
