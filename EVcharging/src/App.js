import React from 'react';
import getWeb3 from './utils/getWeb3';
import EVchargingContract from '../build/contracts/EVcharging.json';
import FlightTicketsRegistryContract from '../build/contracts/FlightTicketsRegistry.json';
import AdminPanel from './AdminPanel';
import MyEVutility from './MyEVutility';
import EVstationBrowser from './EVstationBrowser';
import MyPayments from './MyPayments';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SearchIcon from '@material-ui/icons/Search';
import FlightIcon from '@material-ui/icons/Flight';
import StorageIcon from '@material-ui/icons/Storage';
import BuildIcon from '@material-ui/icons/Build';

import './css/oswald.css'
import './App.css'


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // to save instances of web3, of the smart contract and the current account
      web3: null,
      contract: null,
      account: null,
      ipfs: null,
      // the list of evUtilities
      evUtilities: [],
      // whether the user is the admin or not
      userIsAdmin: false,
      // list of evUtilities owned by the user
      userOwnsEVutilities: [],
     // list of slots that user has paid
      userPaidSlots: [],
      // the interface tab that is currently open
      activeTab: 0
    };
   
  }

  componentDidMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        });
        // Instantiate contract once web3 is provided.
        this.init();
      }).catch(() => {
        console.log('Error finding web3.')
      });
  }

  init() {
    // Instantiate the contracts
    const contract = require('truffle-contract');
    const evCharging = contract(EVchargingContract);
    const flightTicketsRegistry = contract(FlightTicketsRegistryContract);
    evCharging.setProvider(this.state.web3.currentProvider);
    flightTicketsRegistry.setProvider(this.state.web3.currentProvider);

    // Initialize IPFS interface
    const IPFS = require('ipfs-api');
    const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    this.setState({ ipfs: ipfs });

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.log('Failed to get accounts. Error: ', error);
        return;
      }
      // Save the current account
      this.setState({ account: accounts[0] });
      // Get registry contract
      flightTicketsRegistry.deployed()
        .then(instance => instance.backendContract.call())
        // Get our main contract from the address stored in the registry
        .then(backendAddress => evCharging.at(backendAddress))
        // Save the instance of the contract
        .then(instance => this.setState({ contract: instance }))
        .then(() => {
          // Detect when account changes
          setInterval(() => {
            this.state.web3.eth.getAccounts((error, accounts) => {
              if (accounts[0] !== this.state.account) {
                // Update account in the state, update the user rights, flush my payments
                this.setState({
                  account: accounts[0],
                  userPaidSlots: []
                }, () => {
                  this.setUserRights();
                  this.initMyPayments();
                });
              }
            });
          }, 500);
          // Load the list of evUtilities from the contract
          return this.loadEVutilities();
        }).then(result => {
          // Set the user rights depending on their account
          return this.setUserRights();
        }).then(result => {
          // Update the list every time when an evUtility is added/updated/removed
          let updateEVutilitiesCallback = (error, result) => {
            if (error) {
              console.log(error);
              return;
            }
            // Update the list of evUtilities and update the rights of the user
            this.loadEVutilities().then(this.setUserRights);
          }
          this.state.contract.LogEVutilityAdded().watch(updateEVutilitiesCallback);
          this.state.contract.LogEVutilityUpdated().watch(updateEVutilitiesCallback);
          //this.state.contract.LogEVutilityRemoved().watch(updateEVutilitiesCallback);
          // Update the user rights when the contract changes its owner (very rare case, but still)
          this.state.contract.OwnershipTransferred().watch(this.setUserRights);
          // Fill and update My Payments
          this.initMyPayments();
          // Call other callbacks that might be waiting for the contract to get ready
          if (typeof this.onContractReady === 'function') {
            this.onContractReady();
          }
        }).catch(error => {
          console.log(error);
        });
    });
  }

  initMyPayments() {
    console.log("Inside initMyPayments()");
    if (this.myPaymentsFilter) {
      this.myPaymentsFilter.stopWatching();
    }
    this.myPaymentsFilter = this.state.contract.LogSlotPaid(
      { customer: this.state.account },
      { fromBlock: 0, toBlock: 'latest' }
    ).watch(this.updateSlotsPaid);
  }

  setOnContractReady = (callback) => {
    console.log("Inside setOnContractReady()");
    this.onContractReady = () => {
      callback(this.state.web3, this.state.contract);
    }
    if (this.state.web3 !== null && this.state.contract !== null) {
      this.onContractReady();
    }
  };

  /** Figure out the rights of the user and save it to the state */
  setUserRights = () => {
    // Get the owner of the contract
    return this.state.contract.owner.call().then(owner => {
      // Contract owner is admin
      return this.setState({ userIsAdmin: (this.state.account === owner) });
    }).then(() => {
      // If user is an evUtility owner, find which evUtilities he owns
      let ownedEVutilities = this.state.evUtilities.filter((evUtility, i) => (this.state.account === evUtility.uOwner), this);
      return this.setState({ userOwnsEVutilities: ownedEVutilities });
    });
  };

  /** Get the list of evUtilities from the contract and save it to the state */
  loadEVutilities = () => {
    console.log("Inside loadEVutilities()");

    // First we get the total number of evUtilities
    return this.state.contract.getEVutilityCount.call().then(evUtilityCount => {
      // Then we iterate over the array of evUtilities to load each of them
      let promises = [];
      for (let i = 0; i < evUtilityCount; i++) {
        promises.push(
          this.state.contract.evUtilities.call(i)
        );
      }
      return Promise.all(promises);
    }).then(results => {
      // Now as we have all evUtilities loaded, we save them to the state
      let evUtilities = [];
      results.forEach(row => {
        evUtilities.push({
          uId: row[0].toString(),
          uName: this.state.web3.toUtf8(row[1]),
          uOwner: row[2],
          uLogo: row[3],
          inProgress: false
        });
      });
      evUtilities.sort((a, b) => (parseInt(a.uId, 10) < parseInt(b.uId, 10) ? -1 : 1));
      return this.setState({ evUtilities: evUtilities });
    }).catch(error => {
      console.log(error);
    });
  };

  setEVutilities = (evUtilities) => {
    return this.setState({ evUtilities: evUtilities });
  };

  /*
   * Loads evStation and evUtility data from the contract and builds an object from it
   * @param {Number} sId - evStation ID
   * @return {Promise} - resolves into an object with evStation and evUtility data
   */
  getEVstationData = (sId) => {
    //console.log("Inside getEVstationData()");

    return this.state.contract.getEVstationById.call(sId).then(data => {
      //console.log("Inside getEVstationDataA()");
      let uId = Number(data[0]);
      return this.state.contract.getEVutilityById.call(uId).then(result => {
      //console.log("Inside getEVstationDataB()");
        let evUtility = {
          uId: Number(result[0]),
          uName: this.state.web3.toUtf8(result[1]),
          uOwner: result[2],
          uLogo: result[3]
        }
        return {
          sId: Number(data[1]),
          city: this.state.web3.toUtf8(data[2]),
          stationName: this.state.web3.toUtf8(data[3]),
          ctype: this.state.web3.toUtf8(data[4]),
          evUtility: evUtility,
        }
      });
    });
  };

  onBookingComplete = (txResult) => {
    txResult.logs.forEach(log => {
      if (log.event !== 'LogSlotPaid')
        return;
      if (log.args.customer !== this.state.account)
        return;
      this.updateSlotsPaid(null, log);
    });
  };

  switchTab = (event, value) => {
    this.setState({ activeTab: value });
  };

  renderMessage = (message) => (
    <div className="App" style={{ textAlign: 'center', marginTop: 100 }}>
      {message}
    </div>
  );

  updateSlotsPaid = (error, result) => {
    if (error) {
      console.log(error);
      return;
    }
    let stationName = 'appStation';
    let uName = 'appUtility';
    let uLogo = 0x2222;
    
    let paymentId = Number(result.args.paymentId);
    //console.log("result.args.paymentId: " + paymentId);
    //let sId = Number(result.args.sId);
    //let uId = Number(result.args.uId);
    let tPrice = Number(result.args.tPrice);
    let tArrival = Number(result.args.tArrival);
    let tDeparture = Number(result.args.tDeparture);
    let customerName = this.state.web3.toUtf8(result.args.customerName);
    
    // Check for duplicates
    if (this.state.userPaidSlots.findIndex(x => x.paymentId === paymentId) > -1) {
      //console.log("paymentId: " + paymentId);
      return;
    }

    //console.log("ApaymentId: " + paymentId);
 
    return this.state.contract.getEVstationById(result.args.sId).then(stationResults => {
        stationName = this.state.web3.toUtf8(stationResults[3]);
        //console.log("0stationName: " + stationName);
    }).then( () => {
      return this.state.contract.getEVutilityById(result.args.uId).then(utilityResults => {
        uName = this.state.web3.toUtf8(utilityResults[1]);
        uLogo = utilityResults[3];
      }).then( () => {
  
        // Add the slot to my payments in the loading state first
        let newPayment = {
          isLoading: true,
          paymentId: paymentId,
          customerName: customerName,
          stationName: stationName,
          tArrival: tArrival,
          tDeparture: tDeparture,
          tPrice: tPrice,
          uLogo: uLogo,
          uName: uName
        }
        this.setState(state => ({
          userPaidSlots: [...state.userPaidSlots, newPayment]
        }));
        return this.getEVstationData(result.args.sId).then(paidSlot => {
          // Update the EVstation with actual data and quit the loading state
          this.setState(state => ({
            userPaidSlots: state.userPaidSlots.map(paid => {
              if (paid.paymentId === newPayment.paymentId) {
                paidSlot.paymentId = newPayment.paymentId;
                //console.log("paidSlot.paymentId: " + newPayment.paymentId);
                paidSlot.customerName = newPayment.customerName;
                paidSlot.stationName = newPayment.stationName;
                paidSlot.tArrival = newPayment.tArrival;
                paidSlot.tDeparture = newPayment.tDeparture;
                paidSlot.tPrice = newPayment.tPrice;
                paidSlot.uLogo = newPayment.uLogo;
                paidSlot.uName = newPayment.uName;
                paidSlot.isLoading = false;
                return paidSlot;
              }
              
              //console.log("paid.paymentId: " + paid.paymentId);
              return paid;
            })
          }));
        })
     })
   });
 };


  render() {
    if (!this.state.web3) {
      return this.renderMessage('Waiting for web3...');
    }
    // Make sure the user does not accidentially spend real ETH here
    // Remove this block in production
    if (this.state.web3.version.network === '1') {
      return this.renderMessage('You are connected to Ethereum mainnet! You should switch to a testnet.');
    }
    if (!this.state.account) {
      return this.renderMessage('Getting user account... Make sure you are logged in with MetaMask.');
    }
    if (!this.state.contract) {
      return this.renderMessage('Connecting to the contracts... It may take a while, please be patient.');
    }
    return (
      <div className="App">
        <Paper square>
          <Tabs
            value={this.state.activeTab}
            onChange={this.switchTab}
            fullWidth
            centered
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab icon={<SearchIcon />} label="Search Charging Slots" value={0} />
            <Tab icon={<StorageIcon />} label="My Payments" value={1} />
            {this.state.userOwnsEVutilities.length > 0 && (
              <Tab icon={<FlightIcon />} label="My EVutility" value={2} />
            )}
            {this.state.userIsAdmin && (
              <Tab icon={<BuildIcon />} label="Admin Panel" value={3} />
            )}
          </Tabs>
        </Paper>

        <div className="current-account">
          Account: {this.state.account}
        </div>

        <main className="container">

          {this.state.activeTab === 0 && (
            <EVstationBrowser
              web3={this.state.web3}
              contract={this.state.contract}
              account={this.state.account}
              navigateToMyPayments={() => { this.switchTab(null, 1); }}
              getEVstationData={this.getEVstationData}
              onBookingComplete={this.onBookingComplete}
            />
          )}
          {this.state.activeTab === 1 && (
            <MyPayments
              web3={this.state.web3}
              contract={this.state.contract}
              account={this.state.account}
              mySlots={this.state.userPaidSlots}
            />
          )}
          {this.state.activeTab === 2 && this.state.userOwnsEVutilities.length > 0 && (
            <MyEVutility
              evUtilities={this.state.userOwnsEVutilities}
              setOnContractReady={this.setOnContractReady}
              account={this.state.account}
              getEVstationData={this.getEVstationData}
            />
          )}
          {this.state.activeTab === 3 && this.state.userIsAdmin && (
            <AdminPanel
              evUtilities={this.state.evUtilities}
              setEVutilities={this.setEVutilities}
              web3={this.state.web3}
              contract={this.state.contract}
              account={this.state.account}
              ipfs={this.state.ipfs}
            />
          )}

        </main>
      </div>
    );
  }
}

export default App;
