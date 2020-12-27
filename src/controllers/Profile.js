/**
 * @description  Check if is available to deposit (if amount to deposit is greater than 25 % of pending jobs to pay
    cant deposit)
 * @param {number} jobsPendingSum Sum of all unpaid pending jobs of a client.
 * @param {number} amount Amount to deposit
 * @returns {boolean} Depending if can or can not make the deposit.
 */
const canMakeDeposit = (jobsPendingSum, amount)=>{
    if (amount <= jobsPendingSum * 0.25) {
        return true;
    }
    return false;
}

/**
 * 
 * @param {number} amount Amount to deposit
 * @param {number} userId user identifier
 * @param {object} models Object with the sequelize models of Profile.
 * @returns {promise} Promise that resolve in boolean, depending if t he deposit was made or not.
 */
const makeDepositToUser = async (amount, userId, models) => {
    try {
        const { Profile } = models;
        const userToDeposit = await Profile.findOne({ where: { id: userId } });
        if (!userToDeposit) return false;
        userToDeposit.balance += amount;
        await userToDeposit.save();
        return true;
    } catch(err) {
        console.log(err);
        return false;
    }
}
module.exports = {
    canMakeDeposit,
    makeDepositToUser,
};