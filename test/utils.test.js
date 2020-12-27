const { expect } = require('chai');
const Utils = require('../src/controllers/utils');

describe("Utils...", () => {

    it("pass the validation date..", () => {
        expect(Utils.validateDateFormat('2020/10/30', 'YYYY/MM/DD')).to.be.true;
    });
    
    it("not pass the validation date..", () => {
        expect(Utils.validateDateFormat('2020/10/45', 'YYYY/MM/DD')).to.be.false;
        expect(Utils.validateDateFormat('2020-10-45', 'YYYY/MM/DD')).to.be.false;
    });

});