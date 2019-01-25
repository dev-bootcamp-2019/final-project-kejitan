import React from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardMedia from '@material-ui/core/CardMedia';
import CircularProgress from '@material-ui/core/CircularProgress';
import grey from '@material-ui/core/colors/grey';

const defaultLogoHash = 'QmZ9Nbn5Bfcf28p5Mn9Aobw2hvkW4ANxJJDBZdh5kUyQPm';
const ipfsGatewayPrefix = 'https://ipfs.io/ipfs/';
//const defaultType = 'Level2';

/**
 * A form to create a new EVutility
 * @param onValidate - function to be called to validate the data before submitting
 * @param onSubmit - function to be called to submit the data
 */
class EVutilityForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // input data
      uName: '',
      uOwner: '',
      uLogoHash: defaultLogoHash,
      evUtilityLogoFile: '',
      // errors for the inputs
      uNameError: '',
      uOwnerError: '',
      // flag when uploading to IPFS
      isUploading: false
    };
    this.evUtilityLogoInput = React.createRef();
  }

  /** Update the data in the state whenever an input value is changed */
  change = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  captureFile = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({ isUploading: true });
    let file = e.target.files[0];
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = async () => {
      // File is converted to a buffer to prepare for uploading to IPFS
      let buffer = await Buffer.from(reader.result);
      // Upload the file to IPFS and save the hash
      this.props.ipfs.add(buffer).then(result => {
        let fileHash = result[0].hash;
        console.log('Logo uploaded: ', fileHash);
        this.setState({
          uLogoHash: fileHash,
          isUploading: false
        });
      }).catch(err => {
        console.log('Failed to upload the logo to IPFS: ', err);
      })
    };
  };

  removeLogo = () => {
    this.setState({
      uLogoHash: defaultLogoHash,
      isUploading: false
    });
  }

  /** Submit the data */
  onSubmit = e => {
    e.preventDefault();
    // Clear the errors first
    this.setState({
      uNameError: '',
      uOwnerError: ''
    });
    // Extract and format the data
    let data = {
      uLogo: this.state.uLogoHash,
      uName: this.state.uName.trim(),
	    uOwner: this.state.uOwner.trim()
    };
    // Validate the data
    this.props.onValidate(data).then(errors => {
      if (Object.keys(errors).length > 0) {
        // Set errors if any
        this.setState(errors);
      } else {
        // Submit the data
        this.props.onSubmit(data);
        // And clear the form
        this.setState({
          uName: '',
          uOwner: '',
          uLogoHash: defaultLogoHash,
          evUtilityLogoFile: ''
        });
      }
    });
  };

  render() {
    return (
      <form onSubmit={e => this.onSubmit(e)}>
        <Grid container spacing={24}>
          <Grid item xs={3}>
            <input
              className="evUtility-logo-input"
              ref={this.evUtilityLogoInput}
              type="file"
              value={this.state.evUtilityLogoFile}
              onChange={this.captureFile}
            />
            <Card className="evUtility-logo-card">
              {this.state.isUploading ? (
                <CircularProgress size={50} style={{ color: grey[200] }} className="evUtility-logo-loader" />
              ) : null}
              <CardMedia
                className="evUtility-logo-form-image"
                image={ipfsGatewayPrefix+this.state.uLogoHash}
                title="EVutility Logo"
              />
              <CardActions className="evUtility-logo-actions">
                <Button
                  size="small"
                  color="primary"
                  onClick={() => this.evUtilityLogoInput.current.click()}
                  className="evUtility-logo-button"
                >
                  Upload Logo
                </Button>
                <Button
                  size="small"
                  color="primary"
                  className="evUtility-logo-button"
                  onClick={this.removeLogo}
                >
                  Remove Logo
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <TextField
              name="uName"
              placeholder="EVutility Name"
              label="EVutility Name"
              fullWidth={true}
              value={this.state.uName}
              onChange={this.change}
              helperText={this.state.uNameError}
              error={this.state.uNameError.length > 0}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              name="uOwner"
              placeholder="EVutility Owner Address"
              label="EVutility Owner"
              fullWidth={true}
              value={this.state.uOwner}
              onChange={this.change}
              helperText={this.state.uOwnerError}
              error={this.state.uOwnerError.length > 0}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={this.state.isUploading}
              style={{ marginTop: 7 }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </form>
    );
  }
}

export default EVutilityForm;
