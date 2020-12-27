const { expect } = require('chai');
const Jobs = require('../src/controllers/Jobs');

describe("Jobs...", () => {
    it("Get unpaid where clause", () => {
        let where = Jobs.getWhereUnpaid();
        expect(where.paid).to.be.null;
    });

    it("makes payment transaction with enought funds..", async() => {
        const job = {
            save: async()=>{Promise.resolve()},
            paid: null,
            paymentDate: null,
            price: 200,
        };
        const contractor = {
            save: async()=>{Promise.resolve()},
            balance: 0,
        };
        const client = {
            save: async()=>{Promise.resolve()},
            balance: 250,
        };
        
        const res = await Jobs.makePayJobTransaction({job,contractor, client});
        
        expect(res).to.be.true;
        expect(job.paid).equal(1);
        expect(job.paymentDate).not.null;
        expect(contractor.balance).equal(200);
        expect(client.balance).equal(50);
    });
    
    it("cant make payment transaction without funds..", async() => {
        const job = {
            save: async()=>{Promise.resolve()},
            paid: null,
            paymentDate: null,
            price: 200,
        };
        const contractor = {
            save: async()=>{Promise.resolve()},
            balance: 0,
        };
        const client = {
            save: async()=>{Promise.resolve()},
            balance: 150,
        };
        
        const res = await Jobs.makePayJobTransaction({job,contractor, client});
        
        expect(res).to.be.false;
        expect(job.paid).to.be.null;
        expect(job.paymentDate).to.be.null;
        expect(contractor.balance).equal(0);
        expect(client.balance).equal(150);
    });
});