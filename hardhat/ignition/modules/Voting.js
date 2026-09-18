const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VotingModule", (m) => {
    const feeInWei = 100n;
    const voting = m.contract("VotingSystem", [feeInWei]);
    return { voting };
});