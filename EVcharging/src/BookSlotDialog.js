import React from 'react';
//import BookSlotSummary from './BookSlotSummary';
import FreeSlotsSummary from './FreeSlotsSummary';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
import grey from '@material-ui/core/colors/grey';


/**
 * Displays a modal window to charge a vehicle. Asks to enter customer details
 * and submits the data back to the parent via callback.
 * @param isOpen - a bool flag whether the modal is open right now or not
 * @param onClose - a callback to close the modal
 * @param onSubmit - a callback to submit the data, which is expected to call the callback on completion
 */
class BookSlotDialog extends React.Component {

  state = {
    customerName: '',
    customerNameError: '',
    isProcessing: false
  }

  /** Update the data in the state whenever an input value is changed */
  change = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  submit = e => {
    e.preventDefault();
    this.setState({
      customerNameError: ''
    });
    let data = {
      freeSlot: this.props.freeSlot,
      customerName: this.state.customerName.trim()
    }
    this.setState({
      customerName: data.customerName
    });
    // Validate
    let errors = {};
    if (data.customerName.length === 0) {
      errors.customerNameError = 'Please enter customer name';
    }
    if (Object.keys(errors).length > 0) {
      // Display errors if any
      this.setState(errors);
    } else {
      // Submit the data otherwise and display a loader
      this.setState({ isProcessing: true });
      this.props.onSubmit(data, () => {
        // When the processing is done, remove the loader and clear the form
        this.setState({
          isProcessing: false,
          customerName: ''
        });
      }, () => {
        // When error occured, just remove the loader
        this.setState({
          isProcessing: false
        });
      });
    }
  }

  render() {
    const { isOpen, onClose, freeSlot, formatETH } = this.props;

    return (
      <form>
        <Dialog
          open={isOpen}
          onClose={onClose}
          fullWidth
          maxWidth={false}
        >
          <DialogTitle>Book For Your Charging Station</DialogTitle>
          <DialogContent>
            <FreeSlotsSummary
              freeSlot={freeSlot}
              formatETH={formatETH}
              onClickBook={null}
            />
            <div className="booking-customer-details">
              <p>Please enter customer details:</p>
              <div>
                <TextField
                  name="customerName"
                  placeholder="Customer name"
                  label="Customer name"
                  value={this.state.customerName}
                  onChange={e => this.change(e)}
                  helperText={this.state.customerNameError}
                  error={this.state.customerNameError.length > 0}
                  className="booking-details-field"
                />
              </div>
          </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" onClick={this.submit} color="primary" className="buy-now-button">
              {this.state.isProcessing ? (
                <CircularProgress size={20} style={{ color: grey[200] }} />
              ) : 'Pay Now'}
            </Button>
          </DialogActions>
        </Dialog>
      </form>
    );
  }

}

export default BookSlotDialog;
