const { expect } = require('chai');
const { Op } = require("sequelize");
const Contracts = require('../src/controllers/Contracts');
const {addProfileClause} = require('../src/controllers/utils');

describe("Contracts...", () => {
    it("Add client profile clause to where object", () => {
        let where = addProfileClause({}, 'client', 2);
        expect(where.ClientId).equal(2);
    });

    it("Add contractor profile clause to where object", () => {
        let where = addProfileClause({}, 'contractor', 2);
        expect(where.ContractorId).equal(2);
    });

    it("Get null as the where clause for unkown profile type", () => {
        const where = addProfileClause({}, 'unkownProfileType', 2);
        expect(where).to.be.null;
    });

    it("Get where clause for contracts by contract id correctly", () => {
        const where = Contracts.getWhereClause(1, 'client', 2);
        expect(where.id).equal(1);
    });

    it("Get where clause for all contracts not terminated as client correctly", () => {
        const where = Contracts.getWhereAllNoTerm('client', 2);
        expect(where.status[Op.not]).equal('terminated');
    });
    
    it("Get where clause for all contracts that are active as client correctly", () => {
        const where = Contracts.getWhereAllActive('client', 2);
        expect(where.status).equal('in_progress');
    });
});