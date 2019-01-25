import React from 'react';
import EVstationForm from "./EVstationForm";
import EditableTable from "./EditableTable";
import SoldSlots from './SoldSlots';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';


const ipfsGatewayPrefix = 'https://ipfs.io/ipfs/';

/**
 * A list of evUtility's kiosks with a form to add a new kiosk and edit/remove functionality
 * @param evUtilities - list of evUtilities owned by the user
 * @param setOnContractReady - function to set a callback to be called when web3 and the contract are ready
 * @param account - address of the user
 * @param getEVstationData - function to load detailed information about an slot by sttaion ID
 */
class MyEVutility extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      contract: null,
      // the index of the row that's being edited right now, -1 means none are edited
      editEVstationIdx: -1,
      // errors to display during the edit mode
      editEVstationErrors: {},
      // saved version of an evUtility before editing, to restore the values on cancel
      evStationBeforeEditing: null,
      // current evUtility whise evStations are being managed
      evUtilityIdx: 0,
      // list of evStations the current evUtility has
      evStations: [],
      // list of slots paid already
      soldSlots: []
    };
    //console.log("evUtilities"  + this.props.evUtilities);
    //console.log("evUtility"  + this.props.evUtilities[0]);
    //console.log("uLogo"  + this.props.evUtilities[0].uLogo);

  }

  componentDidMount() {
    this.props.setOnContractReady((web3, contract) => {
      this.setState({
        web3: web3,
        contract: contract
      }, () => {
        // Load the list of evStations from the contract
        this.loadEVstations().then(result => {
          // Update the list every time when a evStation is added/updated/removed
          let updateEVstationsCallback = (error, result) => {
            if (error) {
              console.log(error);
              return;
            }
            // Update the list of evStations
            this.loadEVstations();
          }
          this.state.contract.LogEVstationAdded().watch(updateEVstationsCallback);
          this.state.contract.LogEVstationUpdated().watch(updateEVstationsCallback);
          //this.state.contract.LogEVstationRemoved().watch(updateEVstationsCallback);
          this.initPaidSlots();
         }).catch(error => {
          console.log(error);
        });
      });
    });
  }

  initPaidSlots() {
    if (this.soldSlotsFilter) {
      this.soldSlotsFilter.stopWatching();
    }
    this.soldSlotsFilter = this.state.contract.LogSlotPaid(
      { uId: this.props.evUtilities[this.state.evUtilityIdx].uId },
      //{sId: this.state.evStations[this.state.editEVstationIdx].sId }, //kejitan
      { fromBlock: 0, toBlock: 'latest' }
    ).watch(this.updateSlotsPaid);
  }

  updateSlotsPaid = (error, result) => {
    if (error) {
      console.log(error);
      return;
    }
    let stationName = 'dummyStation';
    let uName = 'dummyUtility';
    let uLogo = 0x1111;
    let paymentId = Number(result.args.paymentId);
    let customerName = this.state.web3.toUtf8(result.args.customerName)
    //console.log("paymentId: " + paymentId);
    // Add the slot to paid slots in the loading state first
    /*
    console.log("sId: " + result.args.sId);
    console.log("uId: " + result.args.uId);
    console.log("buyer: " + result.args.customer);
    console.log("customerName: " + customerName);
    console.log("tPrice: " + result.args.tPrice);
    console.log("tArrival: " + result.args.tArrival);
    console.log("tDeparture: " + result.args.tDeparture);
    */

    // remove duplicates
    if (this.state.soldSlots.findIndex(x => x.paymentId === paymentId) > -1) {
      console.log("paymentId.x: " + paymentId);
      return;
    }
  
    //if (this.state.userPaidSlots.findIndex(x => x.paymentId === paymentId) > -1)
    //  return;

    return this.state.contract.getEVstationById(result.args.sId).then(stationResults => {
      stationName = this.state.web3.toUtf8(stationResults[3]);
      //console.log("0stationName: " + stationName);
    }).then( () => {
    return this.state.contract.getEVutilityById(result.args.uId).then(utilityResults => {
      uName = this.state.web3.toUtf8(utilityResults[1]);
      uLogo = utilityResults[3];
      //console.log("0uLogo: " + uLogo);
      //console.log("0uName: " + uName);
      }).then( () => {
    //let {UUID, uName, UOWNER, uLogo} = this.state.contract.getEVutilityById(result.args.uId);
    //console.log("stationName: " + stationName);
    //console.log("uLogo: " + uLogo);
    //console.log("uName: " + uName);
    let newSlotPaid = {
      isLoading: true,
      paymentId: paymentId,
      buyer: result.args.customer,
      customerName: customerName,
      tPrice: Number(result.args.tPrice),
      stationName: stationName,
      uName: uName,
      uLogo: uLogo,
      tArrival: result.args.tArrival,
      tDeparture: result.args.tDeparture
    }
    this.setState(state => ({
      soldSlots: [...state.soldSlots, newSlotPaid]
    }))


    return this.props.getEVstationData(result.args.sId).then(soldSlot => {
      // Update the EVstation with actual data and quit the loading state
      this.setState(state => ({
        soldSlots: state.soldSlots.map(paid => {
          if (paid.paymentId === newSlotPaid.paymentId) {
            soldSlot.paymentId = newSlotPaid.paymentId;
            soldSlot.customerName = newSlotPaid.customerName;
            soldSlot.stationName = newSlotPaid.stationName;
            soldSlot.tPrice = newSlotPaid.tPrice;
            soldSlot.uName = newSlotPaid.uName;
            soldSlot.uLogo = newSlotPaid.uLogo;
            soldSlot.buyer = newSlotPaid.buyer;
            soldSlot.tArrival = newSlotPaid.tArrival;
            soldSlot.tDeparture = newSlotPaid.tDeparture;
            soldSlot.isLoading = false;
            return soldSlot;
          }
          return paid;
        })
      }));
    })
  })
});
};

initSoldSlots() {
  if (this.soldSlotsFilter) {
    this.soldSlotsFilter.stopWatching();
  }
  this.soldSlotsFilter = this.state.contract.LogSlotPaid(
    { uId: this.props.evUtilities[this.state.evUtilityIdx].uId },
    { fromBlock: 0, toBlock: 'latest' }
  ).watch(this.updateSlotsPaid);
}


  /** Get the list of kiosks from the contract and save it to the state */
  loadEVstations = () => {
    // First we get the total number of evStations that the evUtility has
    const uId = this.props.evUtilities[this.state.evUtilityIdx].uId;
    return this.state.contract.getEVstationsCount.call(uId).then(evStationsCount => {
      // Then we iterate over the array of kiosks to load each of them
      let promises = [];
      for (let i = 0; i < evStationsCount; i++) {
        promises.push(
          this.state.contract.getEVstationByEVutility.call(uId, i)
        );
      }
      return Promise.all(promises);
    }).then(results => {
      // Now as we have all our evStations loaded, we save them to the state
      let evStations = [];
      results.forEach(row => {
        evStations.push({
          uId: row[0].toString(),
          sId: row[1].toString(),
          city: this.state.web3.toUtf8(row[2]),
          stationName: this.state.web3.toUtf8(row[3]),
          ctype: this.state.web3.toUtf8(row[4]),
          inProgress: false
        });
      });
      //evStations.sort((a, b) => (parseInt(a.sId, 10) < parseInt(b.sId, 10) ? -1 : 1));
      return this.setState({ evStations: evStations });
    }).catch(error => {
      console.log(error);
    });
  }

  /** When user chooses one of the evUtilities he owns */
  selectEVutility = (e) => {
    this.setState({
      evUtilityIdx: e.target.value,
      soldSlots: []
    }, () => {
      this.loadEVstations();
      this.initSoldSlots();
    });
  }

  /**
   * Validate the input before a evStation is added.
   * @param {object} evStation - object containing evStation data: { city, stationName, ctype }
   * @return {object} - object of errors, empty object means no errors
   */
  evStationValidateSubmit = (evStation) => {
    let errors = {};
    if (evStation.city.length === 0) {
      errors.cityError = 'City is required';
    }
    if (evStation.stationName.length === 0) {
      errors.stationNameError = 'Station Name is required';
    }
    if (evStation.ctype.length === 0) {
      errors.ctype = 'Charger Type is required';
    }
    return errors;
  }

    /**
   * Validate the input before a evStation is changed.
   * @param {object} evStation - object containing EVstation data:
   * @return {object} - object of errors, empty object means no errors
   */
  evStationValidateEdit = (evStation) => {
    let errors = {};
    return errors;
  }

 
  /** Add a new evStation to the contract and update the state to display the change */
  
  evStationSubmit = (evStation) => {
    const uId = this.props.evUtilities[this.state.evUtilityIdx].uId;
    // Add the evStation to the contract
    this.state.contract.addEVstation(
      uId,
      evStation.city,
      evStation.stationName,
      evStation.ctype,
      { from: this.props.account }
    ).then(() => {
      // Add the new kiosk to the list, but grayed out (inProgress: true)
      // It will update to normal automatically when the transaction completes
      this.setState(state => ({
        evStations: [...state.evStations, {
          //sId: null,
          city: evStation.city,
          stationName: evStation.stationName,
          ctype: evStation.ctype,
          inProgress: true
        }]
      }));
    }).catch(error => {
      console.log(error);
    });
  }

  /**
   * Enable edit mode
   * @param {number} i - index of the row to be edited
   */
  startEditing = (i) => {
    if (this.state.editEVstationIdx === -1) {
      this.setState(state => ({
        editEVstationIdx: i,
        evStationBeforeEditing: state.evStations[i]
      }));
    }
  }

  /** Finish editing, save the changes to the contract and update the table */
  finishEditing = () => {
    let evStationEdited = this.state.evStations[this.state.editEVstationIdx];
    // Clear the old errors first
    this.setState({
      editEVstationkErrors: {}
    });
    // If nothing changed, just turn off the edit mode, no need to submit anything
    if (evStationEdited === this.state.evStationBeforeEditing) {
      return this.setState({
        editEVstationIdx: -1,
        evStationBeforeEditing: null
      });
    }
    // Validate the new values
    let errors = this.evStationValidateEdit(evStationEdited);
    // If anything is wrong with the input, display the errors and remain in the edit mode
    if (Object.keys(errors).length > 0) {
      return this.setState({
        editEVstationErrors: errors
      });
      // If everything is fine, update the evStation in the contract
    } else {
      this.state.contract.editEVstation(
        this.state.evStationBeforeEditing.sId,
        evStationEdited.city,
        evStationEdited.stationName,
        evStationEdited.ctype
      ).then(() => {
        // Turn off the edit mode and gray out the evStation in the table until the transaction completes
        this.setState(state => ({
          evStations: state.evStations.map((evStation, j) => {
            if (j === state.editEVstationIdx) {
              evStation.inProgress = true;
            }
            return evStation;
          }),
          editEVstationIdx: -1,
          evStationBeforeEditing: null
        }));
      }).catch(error => {
        console.log(error);
      });
    }
    return errors;
  }

  /** Quit the edit mode and revert the changes */
  cancelEditing = () => {
    this.setState(state => ({
      evStations: state.evStations.map((evStation, j) => j === state.editEVstationIdx ? state.evStationBeforeEditing : evStation),
      editEVstationIdx: -1,
      editEVstationErrors: {},
      evStationBeforeEditing: null
    }));
  }

  /** Handle changes in the inputs when in the edit mode */
  onInputChanged = (e, name, i) => {
    const { value } = e.target;
    this.setState(state => ({
      kiosks: state.evStations.map((evStation, j) => j === i ? { ...evStation, [name]: value } : evStation)
    }));
  }


  render() {
    return (
      <div>
        <FormControl>
          <InputLabel htmlFor="evUtility-select">EVutility</InputLabel>
          <Select
            value={this.state.evUtilityIdx}
            onChange={this.selectEVutility}
            inputProps={{ id: 'evUtility-select' }}
          >
            {this.props.evUtilities.map((evUtility, i) => (
              <MenuItem value={i} key={'asi-' + i}>{evUtility.uName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <div>
          <img
            src={ipfsGatewayPrefix + this.props.evUtilities[this.state.evUtilityIdx].uLogo}
            className="evUtility-logo"
            alt="logo"
          />
        </div>

        <h2>Sold Slots</h2>

        <SoldSlots
          web3={this.state.web3}
          contract={this.state.contract}
          account={this.props.account}
          soldSlots={this.state.soldSlots}
        />

        <h2>Manage EVstations</h2>

        <Grid container spacing={24}>
          <Grid item xs={4}>
            <Paper style={{ padding: 10 }}>
              <EVstationForm
                onValidate={this.evStationValidateSubmit}
                onSubmit={this.evStationSubmit} />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <EditableTable
              handleChange={this.onInputChanged}
              handleRemove={this.evStationRemove}
              startEditing={this.startEditing}
              finishEditing={this.finishEditing}
              cancelEditing={this.cancelEditing}
              editIdx={this.state.editEVstationIdx}
              data={this.state.evStations}
              dataErrors={this.state.editEVstationErrors}
              dataStructure={[
                {
                  name: 'ID',
                  prop: 'sId',
                  editable: false,
                  type: 'text'
                },
                {
                  name: 'City',
                  prop: 'city',
                  editable: false,
                  errorProp: 'cityError',
                  type: 'text'
                },
                {
                  name: 'Station Name',
                  prop: 'stationName',
                  editable: false,
                  errorProp: 'evStationError',
                  type: 'text'
                },
                {
                  name: 'Charger Type',
                  prop: 'ctype',
                  editable: true,
                  errorProp: 'ctypeError',
                  type: 'text'
                }
              ]} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default MyEVutility;
