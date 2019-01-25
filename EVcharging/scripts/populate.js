const Web3 = require('web3');
const contract = require('truffle-contract');
const contractData = require('../build/contracts/EVcharging.json');
const sampleData = require('../sample-data.json');

const ethRPC = "http://localhost:8545";
const uLogoDefault = 'QmZ9Nbn5Bfcf28p5Mn9Aobw2hvkW4ANxJJDBZdh5kUyQPm';

var web3 = new Web3(new Web3.providers.HttpProvider(ethRPC));
const EVcharging = contract(contractData);
EVcharging.setProvider(web3.currentProvider);

web3.eth.getAccounts((error, accounts) => {
  if (error) {
    console.error('Failed to get accounts. ', error);
    return;
  }
  EVcharging.deployed().then(async instance => {
    // we're all set, let's stuff the contract with some sample data now
    await populate(instance, accounts);
  }).catch(error => {
    console.error(error);
  });
});

async function populate(evCharging, accounts) {
  try {
    // check if we have the owner's account
    if (await evCharging.owner.call() !== accounts[0]) {
      return console.log('Deploy the contract from the first account provided by ', ethRPC);
    }
    for (let i = 0; i < sampleData.data.length; i++) {
      let row = sampleData.data[i];
      // admin will own the first airline, the second account owns second and third airlines,
      // the rest are owned by the third account
      let uOwner = i <= 2 ? (i === 0 ? accounts[0] : accounts[1]) : accounts[2];
      console.log('Adding evUtility: ' + row.evUtility.uName + ' owned by ' + uOwner + '...');
      await evCharging.addEVutility(
        row.evUtility.uName,
        uOwner,
        row.evUtility.uLogo ? row.evUtility.uLogo : uLogoDefault,
        { from: accounts[0], gas: 300000 }
      );
      let uId = Number(await evCharging.uIdLast.call());
      for (let j = 0; j < row.evStations.length; j++) {
        let evStation = row.evStations[j];
        console.log(
          'Adding evStation: '+evStation.city+' ' + evStation.stationName + ' ' + evStation.type
        );
        
        await evCharging.addEVstation(
          uId, evStation.city, evStation.stationName, evStation.type,
          { from: uOwner, gas: 500000 }
        );
      }
      let count = await evCharging.getEVstationsCount.call(uId);
      console.log(row.evUtility.uName + ' now has ' + count + ' evStations.');
    }
  } catch (e) {
    if (/revert/.test(e.message)) {
      console.error('Transaction reverted. Contract data not empty?');
    } else {
      console.error('Failed to populate the contract with data. ', e.message);
    }
  }
}