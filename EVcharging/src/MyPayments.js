import React from 'react';
import Slot from './Slot';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

/**
 * Displays a list of user's purchased slots.
 * @param web3 - instance of web3
 * @param contract - instance of the smart contract
 * @param account - address of the user
 * @param mySlots - list of slots purchased by the user
 */
class MyPayments extends React.Component {

  formatETH = price => {
    return this.props.web3.fromWei(price, 'ether') + ' ETH';
  }

  render() {
    let slots = this.props.mySlots;
    slots.sort((a, b) => (b.purchaseId - a.purchaseId));

    return (
      <div>
        <h1>My Payments</h1>
        {slots.length === 0 ? (
          <div>
            You haven't purchased any charging session (slot) yet
          </div>
        ) :
          slots.map((slot, i) => (
            <Paper key={`mp-${i}`} className="my-purchase-paper">
              <Grid container spacing={16}>
                <Grid item xs={1}>
                  <div className="purchase-id">{slot.paymentId}</div>
                </Grid>
                <Grid item xs={8}>
                  {slot.isLoading ? (
                    <div className="my-purchase-loading">
                      <CircularProgress size={20} />
                    </div>
                  ) : (
                      <Slot
                        slot={slot}
                        formatETH={this.formatETH}
                      />
                    )}
                </Grid>
                {slot.customerName ? (
                  <Grid item xs={3}>
                    <div className="slot-customer-details">
                      <div>Customer Name: </div>
                      <div><span className="customer-details-value">{slot.customerName}</span></div>
                    </div>
                  </Grid>
                ) : null}
              </Grid>
            </Paper>
          ))
        }
      </div>
    );
  }

}
//              <Grid container spacing={16}>
export default MyPayments;
