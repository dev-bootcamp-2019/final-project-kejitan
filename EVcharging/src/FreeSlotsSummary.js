import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
const ipfsGatewayPrefix = 'https://ipfs.io/ipfs/';


function formatDuration(seconds) {
  let hours = Math.floor(seconds / 3600);
  let remainder = seconds % 3600;
  let minutes = Math.floor(remainder / 60);
  let str = hours + 'h';
  if (minutes > 0) {
    str += ' ' + minutes + 'min';
  }
  return str;
}

function FreeSlotsSummary(props) {
    const { freeSlot, formatETH, onClickBook } = props;

  let duration = formatDuration(freeSlot.tDeparture - freeSlot.tArrival);
  return (
 

    <Grid container spacing={16}>
      <Grid item xs={2}>
          <div className="duration">Duration: {duration}</div>
      </Grid>
      <Grid item xs={2}>
        <img src={ipfsGatewayPrefix + freeSlot.chargingStation.evUtility.uLogo} className="evUtility-logo-small" alt="logo" />
      </Grid>
      <Grid item xs={3}>
        <div className="city">{freeSlot.chargingStation.evUtility.uName}</div>
      </Grid>
      <Grid item xs={3}>
        <div className="city">{freeSlot.chargingStation.stationName}</div>
      </Grid>
      <Grid item xs={2}>
        <div className="price">
          Total: <span className="price">{formatETH(freeSlot.tPrice)}</span>
        </div>
        {onClickBook !== null ? (
          <Button
            variant="contained"
            color="primary"
            className="book-button"
            onClick={onClickBook}
          >
            Book
          </Button>
        ) : ''}
      </Grid>
    </Grid>
  );
}

export default FreeSlotsSummary;
