import React from 'react';
import Grid from '@material-ui/core/Grid';

const ipfsGatewayPrefix = 'https://ipfs.io/ipfs/';

function formatDate(timestamp) {
  const addZero = i => (i < 10 ? "0" + i : i);
  let d = new Date(timestamp * 1000);
  let day = addZero(d.getDate());
  let month = addZero(d.getMonth() + 1);
  let year = addZero(d.getFullYear());
  let hours = addZero(d.getHours());
  let minutes = addZero(d.getMinutes());
  /*
  let d = new Date(timestamp * 1000);
  let day = addZero(d.getUTCDate());
  let month = addZero(d.getUTCMonth() + 1);
  let year = addZero(d.getUTCFullYear());
  let hours = addZero(d.getUTCHours());
  let minutes = addZero(d.getUTCMinutes());*/
 return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
}
/*
        <div className="datetime">{formatDate(evStation.tArrival)}</div>
        <div className="arrow">&#8594;</div>
        <div className="datetime">{formatDate(evStation.tDeparture)}</div>
*/

function EVstation(props) {
  const { evStation, formatETH } = props;

  return (
    <Grid container spacing={8}>
      <Grid item xs={3}>
        <div className="city">{evStation.city}</div>
        <div className="city">{evStation.stationName}</div>
        <div className="city">{evStation.ctype}</div>
      </Grid>
      <Grid item xs={2}>
        <img src={ipfsGatewayPrefix + evStation.evUtility.uLogo} className="evUtility-logo" alt="logo" />
        <div>by <span className="evUtility">{evStation.evUtility.uName}</span></div>
      </Grid>
    </Grid >
  );
}

export default EVstation;
