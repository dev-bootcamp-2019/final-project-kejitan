const EVcharging = artifacts.require("EVcharging");
const FlightTicketsRegistry = artifacts.require("FlightTicketsRegistry");

// Function to verify that a contract call has failed (reverted) during execution
async function hasReverted(contractCall) {
  try {
    await contractCall;
    return false;
  } catch (e) {
    return /revert/.test(e.message);
  }
}

contract('FlightTicketsRegistry', accounts => {

  const owner = accounts[0];
  const nonOwner = accounts[1];

  let registry, evCharging, evChargingNew;

  // Deploy the contracts
  before(async () => {
    evCharging = await EVcharging.new();
    registry = await FlightTicketsRegistry.new(evCharging.address);
  });

  // Check that contract ownership is set properly
  it('sets the owner', async () => {
    assert.equal(await registry.owner.call(), owner);
  });

  // Check that the main contract address is set correctly
  it('sets the backend contract address', async () => {
    assert.equal(await registry.backendContract.call(), evCharging.address);
  });

  // Upgrade to new version: create a new main contract and change it
  // in the registry (that's the main purpose of the registry)
  it('upgrades the registry to the new backend contract', async () => {
    evChargingNew = await EVcharging.new();
    await registry.changeBackend(evChargingNew.address, { from: owner });
    assert.equal(await registry.backendContract.call(), evChargingNew.address);
  });

  // Check that the previous main contract address is saved for reference
  it('saves the previous backend contract address', async () => {
    assert.equal(await registry.previousBackends.call(0), evCharging.address);
  });

  // Check that only the owner can do such an upgrade
  it('does not allow a non-owner to upgrade the registry', async () => {
    let evChargingV3 = await EVcharging.new();
    assert.ok(await hasReverted(
      registry.changeBackend(evChargingV3.address, { from: nonOwner })
    ));
  });

});
