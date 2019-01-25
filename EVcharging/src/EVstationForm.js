import React from 'react';
///import SlotForm from "./SlotForm";
//import EditableTable from "./EditableTable";
//import SoldSlots from './SoldSlots';
//import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

/**
 * A form to create a new EVstation
 * @param onValidate - function to be called to validate the data before submitting
 * @param onSubmit - function to be called to submit the data
 */
class EVstationForm extends React.Component {
  state = {
    // input data
    city: '',
    stationName: '',
    ctype: '',
    // errors for the inputs
    cityError: '',
    stationNameError: '',
    ctypeError: '',
  };

  /** Update the data in the state whenever an input value is changed */
  change = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  /** Submit the data */
  onSubmit = e => {
    e.preventDefault();
    // Clear the errors first
    this.setState({
      cityError: '',
      stationNameError: '',
      ctypeError: '',
    });
    // Bring together the evKiosk data and cast it to proper formats
    let data = {
      city: this.state.city.trim(),
      stationName: this.state.stationName.trim(),
      ctype: this.state.ctype.trim()
    };
    // Validate the data
    let errors = this.props.onValidate(data);
    if (Object.keys(errors).length > 0) {
      // Set errors if any
      this.setState(errors);
    } else {
      // Submit the data otherwise
      this.props.onSubmit(data);
      // And clear the form
      this.setState({
        city: '',
        stationName: '',
        ctypeError: '',
      });
    }
  };

  render() {
    return (
      <form onSubmit={e => this.onSubmit(e)}>
        <h3 style={{marginTop: 10, marginLeft: 5, marginBottom: 5}}>Add EVstation</h3>
        <Grid container spacing={24}>
          <Grid item xs={6}>
            <TextField
              name="city"
              placeholder="City"
              label="City"
              fullWidth={true}
              value={this.state.city}
              onChange={e => this.change(e)}
              helperText={this.state.cityError}
              error={this.state.cityError.length > 0}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="stationName"
              placeholder="Station Name"
              label="Station Name"
              fullWidth={true}
              value={this.state.stationName}
              onChange={e => this.change(e)}
              helperText={this.state.stationNameError}
              error={this.state.stationNameError.length > 0}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="ctype"
              placeholder="ChargerType"
              label="Charger Type"
              fullWidth={true}
              value={this.state.type}
              onChange={e => this.change(e)}
              helperText={this.state.typeError}
              error={this.state.ctypeError.length > 0}
            />
          </Grid>
        </Grid>
       <Grid container spacing={24}>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Add EVstation
            </Button>
          </Grid>
        </Grid>
      </form>
    );
  }
}

export default EVstationForm;
