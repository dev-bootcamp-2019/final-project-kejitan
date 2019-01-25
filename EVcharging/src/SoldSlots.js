import React from 'react';
import Grid from '@material-ui/core/Grid';

const ipfsGatewayPrefix = 'https://ipfs.io/ipfs/';

function formatDate(timestamp) {
  const addZero = i => (i < 10 ? "0" + i : i);
  let d = new Date(timestamp * 1000);
  /*
  let day = addZero(d.getUTCDate());
  let month = addZero(d.getUTCMonth() + 1);
  let year = addZero(d.getUTCFullYear());
  let hours = addZero(d.getUTCHours());
  let minutes = addZero(d.getUTCMinutes());
  */
  let day = addZero(d.getDate());
  let month = addZero(d.getMonth() + 1);
  let year = addZero(d.getFullYear());
  let hours = addZero(d.getHours());
  let minutes = addZero(d.getMinutes());

  return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
}
/**
 * Displays a list of Slots sold by an EVutility.
 * @param web3 - instance of web3
 * @param contract - instance of the smart contract
 * @param account - address of the user
 * @param soldslots - list of slots sold
 */
class SoldSlots extends React.Component {

  formatETH = price => {
    return this.props.web3.fromWei(price, 'ether') + ' ETH';
  }

  render() {
    let soldSlots = this.props.soldSlots;
    soldSlots.sort((a, b) => (b.paymentId - a.paymentId));

    if (soldSlots.length === 0) {
      return (
        <div>
          Your EVutility has not sold any charging slots yet
        </div>
      );
    } else {
      return (
        <div className="sold-slots-container">
        {soldSlots.map((soldSlot, i) => (
        <Grid container spacing={16}>
          <Grid item xs={2}>
            <div className="datetime">From: {formatDate(soldSlot.tArrival)}</div>
            <div className="datetime">To: {formatDate(soldSlot.tDeparture)}</div>
          </Grid>
          <Grid item xs={2}>
            <img src={ipfsGatewayPrefix + soldSlot.uLogo} className="evUtility-logo-small" alt="logo" />
          </Grid>
          <Grid item xs={3}>
            <div className="city">{soldSlot.city}</div>
          </Grid>
          <Grid item xs={3}>
            <div className="city">{soldSlot.stationName}</div>
          </Grid>
          <Grid item xs={2}>
            <div className="price">
              Total: <span className="price">{this.formatETH(soldSlot.tPrice)}</span>
            </div>
          </Grid>
        </Grid>
        ))}
        </div>
      );
    }
  }

}
                    /* <div className="slot-buyer">Buyer: {slot.buyer}</div> */
  
export default SoldSlots;
