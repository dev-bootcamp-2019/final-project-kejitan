var SafeMath = artifacts.require('SafeMath');
var EVcharging = artifacts.require("EVcharging");
var FlightTicketsRegistry = artifacts.require("FlightTicketsRegistry");

module.exports = function (deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, EVcharging);
  deployer.deploy(EVcharging)
    .then(() => EVcharging.deployed())
    .then(EVcharging => deployer.deploy(FlightTicketsRegistry, EVcharging.address));
};
