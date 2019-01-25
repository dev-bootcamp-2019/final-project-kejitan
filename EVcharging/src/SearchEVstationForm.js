import React from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import grey from '@material-ui/core/colors/grey';
//import FormControlLabel from '@material-ui/core/FormControlLabel';
//import Switch from '@material-ui/core/Switch';


/**
 * A form to search slots
 * @param onValidate - function to be called to validate the data before submitting
 * @param onSubmit - function to be called to submit the data, with a callback to be called when the data is processed
 */
class SearchEVstationForm extends React.Component {
  constructor(props) {
    super(props);

    //console.log("props="+props); //kejitan

    this.state = {
      // input data
      sCity: '',
      tArrivalTime: '',
      tDepartureTime: '',
      sType:'', // Level2 or DC
      sKWH: 0,
      // errors
      sCityError: '',
      tArrivalTimeError: '',
      tDepartureTimeError: '',
      sTypeError:'', // Level2 or DC
      sKWHError: '',
      // flag to show a loader
      isProcessing: false
    }
  }

  /** Update the data in the state whenever an input value is changed */
  change = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  /** Submit the data */
  onSubmit = e => {
    //console.log("searchEVstationForm onSubmit"); //kejitan

    e.preventDefault();
    // Clear the errors first
    this.setState({
      sCityError: '',
      sKWHError: '',
      tArrivalTimeError: '',
      tDepartureTimeError: '',
      sTypeError:'', // Level2 or DC
    });
    // Extract the data and remove unnecessary spaces on the sides, if any
    let data = {
      sCity: this.state.sCity.trim(),
      sKWH: this.state.sKWH,
      tArrivalTime: Date.parse(this.state.tArrivalTime)/1000,
      tDepartureTime: Date.parse(this.state.tDepartureTime)/1000,
      sType: this.state.sType.trim(),
    };
    //console.log("data: " + data.sCity + " " + data.tArrivalTime + ' ' + data.sKWH);
    this.setState({
      sCity: data.sCity,
      sKWH: data.sKWH,
      tArrivalTime: data.tArrivalTime,
      tDepartureTime: data.tDepartureTime,
      sType: data.sType
    });
    // Validate the data
    let errors = this.props.onValidate(data);
    //let errors = {};
    if (Object.keys(errors).length > 0) {
      // Set errors if any
      this.setState(errors);
    } else {
      // Submit the data otherwise and display a loader
      this.setState({ isProcessing: true });
      this.props.onSubmit(data, () => {
        // When the processing is done, remove the loader
        this.setState({ isProcessing: false });
      });
    }
  };


  render() {
    return (
      <form onSubmit={e => this.onSubmit(e)}>
        <Grid container spacing={24}>
          <Grid item xs={2}>
            <TextField
              name="sCity"
              placeholder="City"
              label="City"
              fullWidth={true}
              value={this.state.sFrom}
              onChange={e => this.change(e)}
              helperText={this.state.sCityError}
              error={this.state.sCityError.length > 0}
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              name="sType"
              placeholder="Charger Type"
              label="Type"
              fullWidth={true}
              value={this.state.sType}
              onChange={e => this.change(e)}
              helperText={this.state.sTypeError}
              error={this.state.sTypeError.length > 0}
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              name="sKWH"
              placeholder="KW Hr"
              label="Kwh"
              fullWidth={true}
              value={this.state.sKWH}
              onChange={e => this.change(e)}
              helperText={this.state.sKWHError}
              error={this.state.sKWHError.length > 0}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              name="tArrivalTime"
              placeholder="Arrival Timestamp"
              label="Start time"
              type="datetime-local"
              fullWidth={true}
              value={this.state.tArrivalTime}
              onChange={e => this.change(e)}
              helperText={this.state.tArrivalTimeError}
              error={this.state.tArrivalTimeError.length > 0}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              name="tDepartureTime"
              placeholder="Departure Timestamp"
              label="Stop time"
              type='datetime-local'
              fullWidth={true}
              value={this.state.tDepartureTime}
              onChange={e => this.change(e)}
              helperText={this.state.tDepartureTimeError}
              error={this.state.tDepartureTimeError.length > 0}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={1}>
            <Button type="submit" variant="contained" color="primary" style={{ marginTop: 7 }}>
              {this.state.isProcessing ? (
                <CircularProgress size={20} style={{ color: grey[200] }} />
              ) : 'Search!'}
            </Button>
          </Grid>
       </Grid>
      </form>
    );
  }
}

export default SearchEVstationForm;
