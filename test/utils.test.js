const { expect } = require("chai");
const Utils = require("../src/controllers/utils");

describe("Utils...", () => {
  it("pass the validation date..", () => {
    expect(Utils.validateDateFormat("2020/10/30", "YYYY/MM/DD")).to.be.true;
  });

  it("not pass the validation date..", () => {
    expect(Utils.validateDateFormat("2020/10/45", "YYYY/MM/DD")).to.be.false;
    expect(Utils.validateDateFormat("2020-10-45", "YYYY/MM/DD")).to.be.false;
  });

  it("should get the profession than earned the most", () => {
    const profiles = [
      {
        profession: "Musician",
        Contractor: [{ Jobs: [{ price: 200 }] }],
      },
      {
        profession: "Musician",
        Contractor: [{ Jobs: [{ price: 500 }] }, { Jobs: [{ price: 300 }] }],
      },
      {
        profession: "Fighter",
        Contractor: [{ Jobs: [{ price: 500 }, { price: 5000 }] }],
      },
      {
        profession: "Programmer",
        Contractor: [{ Jobs: [{ price: 10000 }] }],
      },
    ];
    const earnedMost = Utils.getEarnedMost(profiles);
    expect(earnedMost.earnedMost.prof).equal("Programmer");
  });

  it("should get the best N clients (clients that paid the most by job) ", () => {
      const profiles = [
          {
            firstName: "Harry",
            lastName: "Potter",
            Client: [{ Jobs: [{ id:1, price: 200 }, { id:8, price: 100 }] }],
          },
          {
            firstName: "Mr",
            lastName: "Robot",
            Client: [{ Jobs: [{ id:4, price: 350 }, { id:6, price: 1500 }] }],
          },
          {
            firstName: "Ash",
            lastName: "Ketchum",
            Client: [{ Jobs: [{ id:7, price: 3200 }] }],
          }
      ];
      const bestClients = Utils.getBestClient(profiles, 2);
      expect(bestClients.length).equal(2);
      expect(bestClients[0].paid).equal(3200);
      expect(bestClients[0].id).equal(7);
      expect(bestClients[1].paid).equal(1500);
      expect(bestClients[1].id).equal(6);

  });
});
