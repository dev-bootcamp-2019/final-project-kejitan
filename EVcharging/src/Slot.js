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
  let minutes = addZero(d.getUTCMinutes());*/
  let day = addZero(d.getDate());
  let month = addZero(d.getMonth() + 1);
  let year = addZero(d.getFullYear());
  let hours = addZero(d.getHours());
  let minutes = addZero(d.getMinutes());

  return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
}

function Slot(props) {
  const { slot, formatETH } = props;

  return (
    <Grid container spacing={8}>
      <Grid item xs={2}>
        <img src={ipfsGatewayPrefix + slot.uLogo} className="evUtility-logo-small" alt="logo" />
      </Grid>
      <Grid item xs={2}>
        <div className="city">{slot.city}</div>
      </Grid>
      <Grid item xs={3}>
        <div className="city">{slot.stationName} </div>
      </Grid>
      <Grid item xs={2}>
        <div className="datetime">from:{formatDate(slot.tArrival)}</div>
        <div className="datetime">to:  {formatDate(slot.tDeparture)}</div>
      </Grid>
      <Grid item xs={2}>
        <div className="price">{formatETH(slot.tPrice)}</div>
      </Grid>
    </Grid >
  );
}

export default Slot;


