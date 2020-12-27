const { expect } = require('chai');
const Profile = require('../src/controllers/Profile');

describe("Profile...", () => {

    it("pass the validation to deposit..", () => {
        const res = Profile.canMakeDeposit(400, 100)
        expect(res).to.be.true;
    });
    
    it("not pass the validation to deposit..", () => {
        const res = Profile.canMakeDeposit(400, 200)
        expect(res).to.be.false;
    });
    
    it("can make the deposit to user..", async() => {
        const userToDeposit = {
            save: async()=>{Promise.resolve()},
            balance: 0,
        }
        const Prof = {
            findOne: async(whereClause)=> {
                return (whereClause.where.id) ? userToDeposit : null;
            }
        };

        const res = await Profile.makeDepositToUser(200, 5, {Profile: Prof});
        
        expect(res).to.be.true;
        expect(userToDeposit.balance).equal(200);
    });

    it("cant make the deposit to user..", async() => {
        const userToDeposit = {
            save: async()=>{Promise.resolve()},
            balance: 0,
        }
        const Prof = {
            findOne: async(whereClause)=> {
                return (whereClause.where.id) ? userToDeposit : null;
            }
        };

        const res = await Profile.makeDepositToUser(200, null, {Profile: Prof});
        
        expect(res).to.be.false;
        expect(userToDeposit.balance).equal(0);
    });
});