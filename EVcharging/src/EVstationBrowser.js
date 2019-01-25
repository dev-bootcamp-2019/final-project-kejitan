import React from 'react';
import SearchEVstationForm from "./SearchEVstationForm";
import FreeSlotsSummary from './FreeSlotsSummary'
import BookSlotDialog from './BookSlotDialog';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


function SuccessDialog(props) {
  const { isOpen, onClose } = props;
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Booking completed!
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          You have booked your charging slot.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} color="primary">
          Continue Searching
        </Button>
        <Button onClick={() => onClose(true)} color="primary" variant="contained" autoFocus>
          Go To My Payments
        </Button>
      </DialogActions>
    </Dialog>
  );
}


/** Display results of a search */
function SearchEVstationResults(props) {
  const { resultsReady, freeSlots, formatETH, onClickBook } = props;

  //console.log("SearchEVstationResults"); //kejitan

  if (resultsReady) {
    if (freeSlots.length === 0) {
      return (
        <div>
          <h2>Results</h2>
          <div>Sorry, no free charging slots found. Try searching different timing!</div>
        </div>
      );
    } else {
      freeSlots.sort((a, b) => (a.price > b.price));
      /*freeSlots.map((freeSlot, k) => {
        //
        console.log("freeSlot.chargingStation.sId: " + ' ' + freeSlot.chargingStation.sId);
        console.log("freeSlot.chargingStation.city: " + ' ' + freeSlot.chargingStation.city);
        console.log("freeSlot.chargingStation.ctype: " + ' ' + freeSlot.chargingStation.ctype);
        console.log("freeSlot.chargingStation.stationName: " + ' ' + freeSlot.chargingStation.stationName);
        console.log("freeSlot.tPrice: " + ' ' + freeSlot.tPrice);
        console.log("freeSlot.tArrival: " + ' ' + freeSlot.tArrival);
        console.log("freeSlot.tDeparture: " + ' ' + freeSlot.tDeparture);
        console.log("freeSlot.sKWH: " + freeSlot.sKWH);
        console.log("freeSlot.chargingStation.sId: " + ' ' + freeSlot.chargingStation.sId);
        console.log("freeSlot.chargingStation.evUtility.uName: " + ' ' + freeSlot.chargingStation.evUtility.uName);
        console.log("freeSlot.chargingStation.evUtility.uOwner: " + ' ' + freeSlot.chargingStation.evUtility.uOwner);
        console.log("freeSlot.chargingStation.evUtility.uLogo: " + ' ' + freeSlot.chargingStation.evUtility.uLogo);
        //
      });*/
      return (
        <div>
          <h2>Results</h2>
          
          <div>
            {freeSlots.map((freeSlot, i) => (
              <Paper key={`sr-${i}`} className="search-result-paper">
                <FreeSlotsSummary
                  freeSlot={freeSlot}
                  formatETH={formatETH}
                  onClickBook={() => { onClickBook(freeSlot); }}
                />
              </Paper>
            ))}
          </div>
        </div>
      );
    }
  } else {
    return '';
  }
}


/**
 * Slot browser allows a customer to search Charging Stations where vehicles can be charged at given time.
 * @param web3 - instance of web3
 * @param contract - instance of the smart contract
 * @param account - address of the user
 * @param navigateToMyPayments - function to nagivate the user to My Purchases
 * @param onBookingComplete - function to be called when booking transaction is executed
 */
class EVstationBrowser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      freeSlots: [],
      //tPrice: 0,
      //tArrival: 0,
      //tDeparture: 0,
      freeSlotChosen: null,
      resultsReady: false,
      isBookDialogOpen: false,
      isSuccessDialogOpen: false
    }
  }

  /**
   * Validate the input before search is submitted
   * @param {object} search - object containing slot search data: { sCity, sType, tArrivalTime, tDepartureTime }
   * @return {object} - object of errors, empty object means no errors
   */
  searchValidate = (search) => {
    //console.log("searchValidate"); //kejitan

    let errors = {};
    if (search.sCity.length === 0) {
      errors.sFromError = 'Where do you want to charge your vehicle?';
    }
    if (search.sType.length === 0) {
      errors.sToError = 'What type of charger do you want?';
    }
    if (isNaN(search.tArrivalTime)) {
      errors.sArrivalTimeError = 'Choose Arrival Date-Time';
    }
    if (isNaN(search.tDepartureTime)) {
      errors.sDepartureTimeError = 'Choose Departure Date-Time';
    }
    return errors;
  }

  /**
   * Search the freeSlots via the contract and display the result
   * @param search the search form data
   * @param onProcessed callback for when the processing is done and results are displayed
   */
  searchSubmit = (search, onProcessed) => {

    //console.log("searchSubmit"); //kejitan
    //console.log(search.sCity);
    //console.log(search.tArrivalTime);

    // Clear existing results first
    this.setState({
      freeSlots: [],
      //tArrival: search.tArrivalTime,
      //tDeparture: search.tDepartureTime,
      //tPrice: 
      //duration: formatDuration(search.tDeparture - search.tArrival),
      resultsReady: false
    }, () => {
        this.props.contract.findVacantEVStations.call(
          this.props.web3.toHex(search.sCity),
          this.props.web3.toHex(search.sType),
          search.tArrivalTime,
          search.tDepartureTime
        ).then(results => {
          //console.log("results.length: " + results.length);
          for (let i = 0; i < results.length; i++) {
            let sId = Number(results[i]);
            //console.log("sId: " + sId);
            if (sId === 0) {
              // end of results
              break;
            }
            this.props.getEVstationData(sId).then(chargingStation => {  // Check this out--  kejitan 
              // display the result
              //console.log("sId: " + ' ' + sId);
              //console.log("search.tArrivalTime: " + ' ' + search.tArrivalTime);
              //console.log("search.tDepartureTime: " + ' ' + search.tDepartureTime);
              
              this.props.contract.getCost(sId, 
                    search.tArrivalTime, 
                    search.tDepartureTime, 
                    search.sKWH
                  ).then(tPrice => {
                    //let tPrice = 13;
                    //console.log("tPrice: " + ' ' + Number(tPrice));
                    this.setState(state => ({
                      freeSlots: [...state.freeSlots, { tPrice: Number(tPrice),
                                                        sKWH: Number(search.sKWH), 
                                                        tArrival: search.tArrivalTime,
                                                        tDeparture: search.tDepartureTime,
                                                        chargingStation: chargingStation }]
                }));                           
              }); // getCost()
            } ) //getEVstation()
          } // results.length
      }) // results =>
          //console.log("before onProcessed()");
          onProcessed();
          //console.log("after onProcessed()");
          return this.setState({
            resultsReady: true
         });
  })        

    //console.log("exiting searchSubmit()");
}

/*
initEVstationSlots() {
  if (this.myEVstationSlotsFilter) {
    this.myEVstationSlotsFilter.stopWatching();
  }
  this.myEVstationSlotsFilter = this.state.contract.LogSlotAdded(
    //{ customer: this.state.account },
    { sId: this.state.sId},
    { fromBlock: 0, toBlock: 'latest' }
  ).watch(this.updateSlotAdded);
}
*/

  formatETH = price => {
    return this.props.web3.fromWei(price, 'ether') + ' ETH';
  }

  onClickBook = (freeSlot) => {
    this.setState({
      freeSlotChosen: freeSlot,
      isBookDialogOpen: true
    });
  }

  closeBookDialog = () => {
    this.setState({
      isBookDialogOpen: false
    });
  }

  submitBooking = (data, onSuccess, onFailure) => {
    console.log("submitBooking"); //kejitan

    console.log("sId: " + data.freeSlot.chargingStation.sId + ' '
       + data.customerName + ' ' 
       + data.freeSlot.tArrival + ' ' 
       + data.freeSlot.sKWH + ' '
       + ' tPrice: ' + data.freeSlot.tPrice + ' ' 
       + data.freeSlot.tDeparture + ' ' 
       + data.freeSlot.chargingStation.city + ' '
       + data.freeSlot.chargingStation.ctype + ' '
       + data.freeSlot.chargingStation.stationName + ' '
       + data.freeSlot.chargingStation.evUtility.uName       
    ); 
    //console.log("contract: " + this.props.contract);
    //console.log("contract.patSlot: " + this.props.contract.paySlot);
    this.props.contract.paySlot(
      data.freeSlot.chargingStation.sId,
      data.customerName,
      data.freeSlot.tArrival,
      data.freeSlot.tDeparture,
      data.freeSlot.sKWH,
      { from: this.props.account, value: data.freeSlot.tPrice }
    ).then(result => {
      //console.log(" returned from paySlot()");
      onSuccess();
      this.setState({
        isBookDialogOpen: false,
        isSuccessDialogOpen: true
      });
      // Process results of the transaction
      this.props.onBookingComplete(result);
    }).catch(onFailure);
  }

  closeSuccessDialog = (goToMyPayments) => {
    this.setState({
      isSuccessDialogOpen: false
    });
    if (goToMyPayments) {
      this.props.navigateToMyPayments();
    }
  }

  render() {
    return (
      <div>
        <h1>Where do you want to charge your vehicle?</h1>

        <Grid container spacing={24}>
          <Grid item xs={12}>
            <SearchEVstationForm
              onValidate={this.searchValidate}
              onSubmit={this.searchSubmit}
            />
          </Grid>
          <Grid item xs={12}>
            <SearchEVstationResults
              resultsReady={this.state.resultsReady}
              freeSlots={this.state.freeSlots}
              formatETH={this.formatETH}
              onClickBook={this.onClickBook}
            />
          </Grid>
        </Grid>
        <BookSlotDialog
          isOpen={this.state.isBookDialogOpen}
          freeSlot={this.state.freeSlotChosen}
          onClose={this.closeBookDialog}
          onSubmit={this.submitBooking}
          formatETH={this.formatETH}
        />
        <SuccessDialog
          isOpen={this.state.isSuccessDialogOpen}
          onClose={this.closeSuccessDialog}
        />
      </div>
    );
  }
}

export default EVstationBrowser;
