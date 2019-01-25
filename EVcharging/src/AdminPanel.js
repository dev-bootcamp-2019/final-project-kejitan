import React from 'react';
import EVutilityForm from "./EVutilityForm";
import EditableTable from "./EditableTable";
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import grey from '@material-ui/core/colors/grey';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardMedia from '@material-ui/core/CardMedia';

//const defaultLogoHash = 'QmZ9Nbn5Bfcf28p5Mn9Aobw2hvkW4ANxJJDBZdh5kUyQPm';  /* kejitan */
const defaultLogoHash = 'QmUCfFiU19BgdCbnvD9tiXACenpeLTcHoxJGEErUn5Vz66';  /* kejitan */
const ipfsGatewayPrefix = 'https://ipfs.io/ipfs/';

/**
 * A list of evUtilities with a form to add a new evUtility
 * @param evUtilities - list of evUtilities
 * @param setEVutilities - function to update evUtilities
 * @param web3 - instance of web3
 * @param contract - instance of the smart contract
 * @param account - address of the user
 * @param ipfs - IPFS interface
 */
class AdminPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // the index of the row that's being edited right now, -1 means none are edited
      editEVutilityIdx: -1,
      // errors to display during the edit mode
      editEVutilityErrors: {},
      // saved version of an evUtility before editing, to restore the values on cancel
      evUtilityBeforeEditing: null,
      editEVutilityLogoFile: '',
      isEditUploading: false,
      isContractPaused: false,
      isPausing: false,
      isUnpausing: false
    };

    this.editEVutilityLogoInput = React.createRef();

    // Check contract Paused state and listen for updates on that
    /*
    this.props.contract.paused.call().then(paused => {
      this.setState({ isContractPaused: paused });
    });
    this.props.contract.Pause().watch(() => {
      this.setState({ isContractPaused: true, isPausing: false });
    });
    this.props.contract.Unpause().watch(() => {
      this.setState({ isContractPaused: false, isUnpausing: false });
    });
    */
  }

  /**
   * Validate the input before an evUtility is added/changed.
   * This function is made asynchronous because it may execute a contract call,
   * and contract calls must not be executed synchronously.
   * @param {object} evUtility - object containing evUtility data: uName, uOwner
   * @return {Promise} - promise that will resolve to an object of errors; empty object means no errors
   */
  evUtilityValidate = (evUtility) => {
    let errors = {};
    if (evUtility.uName.length < 3) {
      errors.uOwnerError = 'EVutility name needs to be at least 3 characters long';
    }
    if (evUtility.uName.length > 32) {
      errors.uOwnerError = 'EVutility name must not exceed 32 characters';
    }
    if (!this.props.web3.isAddress(evUtility.uOwner)) {
      errors.uOwnerError = 'EVutility owner must be a valid Ethereum address';
    }
    // If we're in edit mode and uName remained unchanged, skip the uniqueness check
    if (this.state.editEVutilityIdx !== -1 && this.state.evUtilityBeforeEditing.uName === evUtility.uName) {
      // We should still return a promise here
      return new Promise((resolved, rejected) => {
        resolved(errors);
      });
    }
    // Check that evUtility name is unique
    return this.props.contract.evUtilityExists.call(this.props.web3.toHex(evUtility.uName)).then(exists => {
      if (exists) {
        errors.uOwnerError = 'This evUtility name already exists';
      }
      return errors;
    });
  }

  /** Add a new evUtility to the contract and update the state to display the change */
  evUtilitySubmit = (evUtility) => {
    // Add the evUtility to the contract
    this.props.contract.addEVutility(
      this.props.web3.toHex(evUtility.uName),
      evUtility.uOwner,
      evUtility.uLogo,
      { from: this.props.account }
    ).then(() => {
      // Add the new evUtility to the list, but grayed out (inProgress: true)
      // It will update to normal automatically when the transaction completes
      this.props.setEVutilities(
        [...this.props.evUtilities, {
          uId: null,
          uName: evUtility.uName,
          uOwner: evUtility.uOwner,
          inProgress: true
        }]
      );
    }).catch(error => {
      console.log(error);
    });
  }


  /**
   * Enable edit mode
   * @param {number} i - index of the row to be edited
   */
  startEditing = (i) => {
    if (this.state.editEVutilityIdx === -1) {
      this.setState(state => ({
        editEVutilityIdx: i,
        evUtilityBeforeEditing: this.props.evUtilities[i]
      }));
    }
  }

  /** Finish editing, save the changes to the contract and update the table */
  finishEditing = () => {
    if (this.state.isEditUploading)
      return;
    let evUtilityEdited = this.props.evUtilities[this.state.editEVutilityIdx];
    // Clear the old errors first
    this.setState({
      editEVutilityErrors: {}
    });
    // If nothing changed, just turn off the edit mode, no need to submit anything
    if (evUtilityEdited === this.state.evUtilityBeforeEditing) {
      return this.setState({
        editEVutilityIdx: -1,
        editEVutilityLogoFile: '',
        evUtilityBeforeEditing: null
      });
    }
    // Validate the new values
    return this.evUtilityValidate(evUtilityEdited).then(errors => {
      // If anything is wrong with the input, display the errors and remain in the edit mode
      if (Object.keys(errors).length > 0) {
        return this.setState({
          editEVutilityErrors: errors
        });
        // If everything is fine, update the evUtility in the contract
      } else {
        this.props.contract.editEVutility(
          this.state.evUtilityBeforeEditing.uId,
          this.props.web3.toHex(evUtilityEdited.uName),
          evUtilityEdited.uOwner,
          evUtilityEdited.uLogo,
          { from: this.props.account }
        ).then(() => {
          // Turn off the edit mode and gray out the evUtility in the table until the transaction completes
          this.props.setEVutilities(
            this.props.evUtilities.map((evUtility, j) => {
              if (j === this.state.editEVutilityIdx) {
                evUtility.inProgress = true;
              }
              return evUtility;
            })
          );
          this.setState({
            editEVutilityIdx: -1,
            editEVutilityLogoFile: '',
            evUtilityBeforeEditing: null
          });
        }).catch(error => {
          console.log(error);
        });
      }
    });
  }

  /** Quit the edit mode and revert the changes */
  cancelEditing = () => {
    this.props.setEVutilities(
      this.props.evUtilities.map((evUtility, j) => {
        return j === this.state.editEVutilityIdx ? this.state.evUtilityBeforeEditing : evUtility
      })
    );
    this.setState({
      editEVutilityIdx: -1,
      editEVutilityErrors: {},
      evUtilityBeforeEditing: null
    });
  }

  /** Handle changes in the inputs when in the edit mode */
  onInputChanged = (e, name, i) => {
    const { value } = e.target;
    this.props.setEVutilities(
      this.props.evUtilities.map((evUtility, j) => j === i ? { ...evUtility, [name]: value } : evUtility)
    );
  }

  pauseContract = () => {
    this.setState({ isPausing: true });
    this.props.contract.pause({ from: this.props.account }).catch(() => {
      this.setState({ isPausing: false });
    });
  }

  unpauseContract = () => {
    this.setState({ isUnpausing: true });
    this.props.contract.unpause({ from: this.props.account }).catch(() => {
      this.setState({ isUnpausing: false });
    });
  }

  editCaptureFile = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({ isEditUploading: true });
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
        this.setState({ isEditUploading: false });
        this.props.setEVutilities(
          this.props.evUtilities.map((evUtility, j) => (
            j === this.state.editEVutilityIdx ? { ...evUtility, uLogo: fileHash } : evUtility
          ))
        );
      }).catch(err => {
        console.log('Failed to upload the logo to IPFS: ', err);
      })
    };
  };

  editRemoveLogo = () => {
    this.setState({ isEditUploading: false });
    this.props.setEVutilities(
      this.props.evUtilities.map((evUtility, j) => (
        j === this.state.editEVutilityIdx ? { ...evUtility, uLogo: defaultLogoHash } : evUtility
      ))
    );
  }

  renderEditLogo = (value) => {
    return (
      <div>
        <input
          className="evUtility-logo-input"
          ref={this.editEVutilityLogoInput}
          type="file"
          value={this.state.editEVutilityLogoFile}
          onChange={this.editCaptureFile}
        />
        <Card className="evUtility-logo-card">
          {this.state.isEditUploading ? (
            <CircularProgress size={50} style={{ color: grey[200] }} className="evUtility-logo-loader" />
          ) : null}
          <CardMedia
            className="evUtility-logo-form-image"
            image={ipfsGatewayPrefix + value}
            title="EVutility Logo"
          />
          <CardActions className="evUtility-logo-actions">
            <Button
              size="small"
              color="primary"
              onClick={() => this.editEVutilityLogoInput.current.click()}
              className="evUtility-logo-button"
            >
              Upload Logo
            </Button>
            <Button
              size="small"
              color="primary"
              className="evUtility-logo-button"
              onClick={this.editRemoveLogo}
            >
              Remove Logo
            </Button>
          </CardActions>
        </Card>
      </div>
    );
  }

  render() {
    return (
      <div>
        <h1>EVutilities</h1>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <EVutilityForm
              onValidate={this.evUtilityValidate}
              onSubmit={this.evUtilitySubmit}
              ipfs={this.props.ipfs}
            />
          </Grid>
          <Grid item xs={12}>
            <EditableTable
              handleChange={this.onInputChanged}
              startEditing={this.startEditing}
              finishEditing={this.finishEditing}
              cancelEditing={this.cancelEditing}
              editIdx={this.state.editEVutilityIdx}
              data={this.props.evUtilities}
              dataErrors={this.state.editEVutilityErrors}
              dataStructure={[
                {
                  name: 'ID',
                  prop: 'uId',
                  editable: false,
                  type: 'text'
                },
                {
                  name: 'Logo',
                  prop: 'uLogo',
                  editable: true,
                  type: 'custom',
                  renderField: (value) => (
                    <img src={ipfsGatewayPrefix + value} className="evUtility-logo" alt="logo" />
                  ),
                  renderEditField: this.renderEditLogo
                },
                {
                  name: 'EVutility Name',
                  prop: 'uName',
                  editable: true,
                  errorProp: 'uOwnerError',
                  type: 'text'
                },
                {
                  name: 'Owner Address',
                  prop: 'uOwner',
                  editable: true,
                  errorProp: 'uOwnerError',
                  type: 'text'
                }
              ]} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default AdminPanel;
/*
{this.state.isContractPaused ? (
          <Button onClick={this.unpauseContract} color="secondary" variant="contained">
            {this.state.isUnpausing ? (
              <CircularProgress size={20} style={{ color: grey[200] }} />
            ) : 'Unpause Contract'}
          </Button>
        ) : (
            <Button onClick={this.pauseContract} color="secondary" variant="contained">
              {this.state.isPausing ? (
                <CircularProgress size={20} style={{ color: grey[200] }} />
              ) : 'Pause Contract'}
            </Button>
          )}
*/