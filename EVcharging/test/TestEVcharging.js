const EVcharging = artifacts.require("EVcharging");
const BigNumber = require('bignumber.js');

// Function to verify that a contract call has failed (reverted) during execution
async function hasReverted(contractCall) {
  try {
    await contractCall;
    return false;
  } catch (e) {
    return /revert/.test(e.message);
  }
}

// Convenience function, to use human-readable dates in the code and still send
// unix timestamps to the contract
function toUTCTimestamp(datestr) {
  return Date.parse(datestr + '+00:00') / 1000;
}

// Sample evUtility logo that we'll use in the tests
const aLogoHash = 'QmUCfFiU19BgdCbnvD9tiXACenpeLTcHoxJGEErUn5Vz66';

contract('EVcharging', accounts => {
  let evCharging;

  // Deploy the contract
  before(async () => {
    evCharging = await EVcharging.new();
  });

  // Check that contract ownership is set properly
  it('sets the owner', async () => {
    assert.equal(await evCharging.owner.call(), accounts[0], 'The aaccount holder is not evCharging system owner');
  });

  // Check that an evUtility is added when the owner is doing it
  it('adds an evUtility from the owner', async () => {
    await evCharging.addEVutility(web3.utils.toHex('Test EVutility'), accounts[2], aLogoHash, { from: accounts[0] });
    assert.equal(await evCharging.getEVutilityCount.call(), 1, 'getEVutilityCount not equal to expected value of 1');
  });

  // Check that the evUtility name is now taken
  it('confirms that the evUtility exists', async () => {
    let exists = await evCharging.evUtilityExists.call(web3.utils.toHex('Test EVutility'));
    assert.ok(exists, 'Test EVutility was expected to exist in teh system');
  });

  // Check that it's not possible to add an evUtility with a non-unique name
  it('does not allow to add an evUtility when the name is taken', async () => {
    assert.ok(await hasReverted(
      evCharging.addEVutility(web3.utils.toHex('Test EVutility'), accounts[2], aLogoHash, { from: accounts[0] })
    ), 'Expected to revert addition of EVutility with an existing name');
  });

  // Check that all evUtility details are saved correctly
  it('stores the evUtility data', async () => {
    let evUtility = await evCharging.evUtilities.call(0);
    uName = web3.utils.toUtf8(evUtility.uName);
    assert.equal(evUtility.uId, 1, 'expected uId equal to 1');
    assert.equal(uName, 'Test EVutility', 'expected EVutility name as Test EVutility');
    assert.equal(evUtility.uOwner, accounts[2], 'expected owner of EVutility as { accounts[2]}');
    assert.equal(evUtility.uLogo, aLogoHash, 'LogoHash did not match expected value in the system');
  });

  // Check that an evUtility can be edited and new details are saved correctly
  it('edits an evUtility', async () => {
    let aNewLogoHash = 'QmP8AdSRBQeMNwt6kyufDDssrA6RxrPB74LEoJgMpYTa6S';
    await evCharging.editEVutility(1, web3.utils.toHex('New EVutility Name'), accounts[3], aNewLogoHash, { from: accounts[0] });
    let evUtility = await evCharging.evUtilities.call(0);
    uName = web3.utils.toUtf8(evUtility.uName);
    assert.equal(evUtility.uId, 1, 'expected uId equal to 1');
    assert.equal(uName, 'New EVutility Name', 'expected new EVutility name as New EVutility Name');
    assert.equal(evUtility.uOwner, accounts[3], 'expected owner of EVutility as { accounts[3]}');
    assert.equal(evUtility.uLogo, aNewLogoHash, 'LogoHash did not match expected value in the system');
  });

  // Check that name uniqueness validation works with editing as well
  it('does not allow to edit an evUtility when the new name is taken', async () => {
    await evCharging.addEVutility(web3.utils.toHex('Second EVutility'), accounts[1], aLogoHash, { from: accounts[0] });
    assert.ok(await hasReverted(
      evCharging.editEVutility(1, web3.utils.toHex('Second EVutility'), accounts[3], aLogoHash, { from: accounts[0] })
    ));
  });

  // Existing evUtility by now: {uId: 2, uName: 'Second EVutility', uOwner: accounts[4]}
  // We will use it for the ticket-related tests below

  // Set up some sample ticket data to reuse in the tests below
  const UID = 2;
  const AOWNER = accounts[1];
  const CITY = 'Hong Kong';
  const EVSTATIONNAME = 'Hong Kong Nissan';
  const CTYPE = 'DC';

  // Check that evUtility ownership is validated correctly when adding adding tickets
  it('does not allow to add an evStation from a non-owner of the evUtility', async () => {
    assert.ok(await hasReverted(
      evCharging.addEVstation(UID, web3.utils.toHex(CITY), web3.utils.toHex(EVSTATIONNAME), web3.utils.toHex(CTYPE), { from: accounts[0] })
    ), 'expected to revert addition of evStation by non owner of the EVutility');
  });

  // Check that it adds some evStations successfully if the evUtility owner is doing it
  it('adds evStations from the owner of the evUtility', async () => {
    await evCharging.addEVstation(UID, web3.utils.toHex(CITY), web3.utils.toHex(EVSTATIONNAME), web3.utils.toHex(CTYPE), { from: AOWNER, gas: 5000000 });
    // add some more
    await evCharging.addEVstation(UID, web3.utils.toHex('Denpasar'), web3.utils.toHex('Denpasdar Enron'), web3.utils.toHex('Level2'), { from: AOWNER, gas: 5000000  });
    await evCharging.addEVstation(UID, web3.utils.toHex('Zhengzhou'), web3.utils.toHex('Singapore Chargepoint'), web3.utils.toHex('DC'), { from: AOWNER, gas: 5000000  });
    let numStations = await evCharging.getEVstationCount.call(UID);
    assert.equal(numStations, 3, 'expected number of evStations as 3');
  });

  // ID of an existing evStation that we're going to reuse below
  const SID = 1;


  // Check that all evStation data is saved correctly
  it('stores the evStation data', async () => {
    let evStation = await evCharging.evStations.call(0);
    assert.equal(evStation.uId, UID, 'expected EVutility ID as ' + toString(UID));
    assert.equal(evStation.sId, SID, 'expected EVstation ID as ' + toString(SID));
    assert.equal(web3.utils.toUtf8(evStation.city), CITY, 'expected EVstation city as ' + CITY);
    assert.equal(web3.utils.toUtf8(evStation.stationName), EVSTATIONNAME, 'expected EVstation Name as ' + EVSTATIONNAME);
    assert.equal(web3.utils.toUtf8(evStation.chargerType), CTYPE), 'expected EVstation Charger Type as ' + CTYPE;
  });

  // Check that a ticket can be edited and the ticket data is updated correctly
  it('edits an evStation', async () => {
    let newStationName = web3.utils.toHex('Mumbai Nissan');
    let newCtype = web3.utils.toHex('DC');
    let newCity = web3.utils.toHex("Knoxville");
    await evCharging.editEVstation(SID, newCity, newStationName, newCtype, { from: AOWNER });
    let evStation= await evCharging.evStations.call(0);
    assert.equal(web3.utils.toUtf8(evStation.stationName), 'Mumbai Nissan', 'expected EVstation Name as Mumbai Nissan');
    assert.equal(web3.utils.toUtf8(evStation.city), 'Knoxville', 'expected EVstation city as Knoxville' );
    assert.equal(web3.utils.toUtf8(evStation.chargerType), 'DC', 'expected EVstation Charger Type as DC' );
  });

   // Book a charging slot of cxhargerType, in City between arrivalTime and departureTime
  it('finds a charging slot', async () => {
   
    await evCharging.addEVstation(
      UID, web3.utils.toHex('Bangkok'), web3.utils.toHex('Bangkok Nissan'), web3.utils.toHex('Level2'), { from: AOWNER }
    );
    await evCharging.addEVstation(
      UID, web3.utils.toHex('Bangkok'), web3.utils.toHex('Bangkok ChargePoint'), web3.utils.toHex('Level2'), { from: AOWNER }
    );
    await evCharging.addEVstation(
      UID, web3.utils.toHex('Bangkok'), web3.utils.toHex('Bangkok ChargePoint'), web3.utils.toHex('DC'), { from: AOWNER }
    );
    await evCharging.addEVstation(
      UID, web3.utils.toHex('Mumbai'), web3.utils.toHex('Mumbai Nissan'), web3.utils.toHex('Level2'), { from: AOWNER }
    );
    
    let arrTime = (new Date('2019-12-10 12:00')).getTime() / 1000;
    let depTime = (new Date('2019-12-10 14:00')).getTime() / 1000;
    
    sIds = await evCharging.findVacantEVStations(web3.utils.toHex('Mumbai'), web3.utils.toHex('Level2'), arrTime, depTime);
    sId = sIds[0];
    let evStation = await evCharging.getEVstationById(sId);
    let evStationId = evStation.sId;
    //assert.equal(sId, evStationId, 'expected EVstation ID as ' + sId + ' actual is ' + evStationId);
    assert.equal(web3.utils.toUtf8(evStation.city), 'Mumbai', 'expected EVstation city as Mumbai');
    assert.equal(web3.utils.toUtf8(evStation.chargerType), 'Level2', 'expected EVstation Charger Type as Level2');
    assert.equal(web3.utils.toUtf8(evStation.stationName), 'Mumbai Nissan', 'Mumbai Nissan', 'expected EVstation Name as Mumbai Nissan');

    arrTime = (new Date('2019-12-10 16:00')).getTime() / 1000;
    depTime = (new Date('2019-12-10 18:00')).getTime() / 1000;
    
    sIds = await evCharging.findVacantEVStations(web3.utils.toHex('Mumbai'), web3.utils.toHex('Level2'), arrTime, depTime);
    sId = sIds[0];
    evStation = await evCharging.getEVstationById(sId);
    evStationId = evStation.sId;
    //assert.equal(evStationId, sId, 'expected EVstation ID as ' + sId + ' actual is ' + evStationId);
    assert.equal(web3.utils.toUtf8(evStation.city), 'Mumbai', 'expected EVstation city as Mumbai');
    assert.equal(web3.utils.toUtf8(evStation.chargerType), 'Level2', 'expected EVstation Charger Type as Level2');
    assert.equal(web3.utils.toUtf8(evStation.stationName), 'Mumbai Nissan', 'Mumbai Nissan', 'expected EVstation Name as Mumbai Nissan');

    arrTime = (new Date('2019-12-10 11:00')).getTime() / 1000;
    depTime = (new Date('2019-12-10 13:00')).getTime() / 1000;
    
    sIds = await evCharging.findVacantEVStations(web3.utils.toHex('Mumbai'), web3.utils.toHex('Level2'), arrTime, depTime);
    let kWH = 40;
    let tPrice = await evCharging.getCost(sIds[0], arrTime, depTime, kWH);
    let amount = Number(tPrice) + 10000000000000000;
    await  evCharging.paySlot( sIds[0], web3.utils.toHex("Liza Minneli"), arrTime, depTime, 40, { from: accounts[1], value: amount });  // expect to be ok unless there is not sufficient balance in the account. 
  });

});

