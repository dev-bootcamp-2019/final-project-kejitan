pragma solidity ^0.5.2;

pragma experimental ABIEncoderV2;

import "../installed_contracts/zeppelin/contracts/math/SafeMath.sol";
import "../installed_contracts/zeppelin/contracts/ownership/Ownable.sol";
import "../installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol";

/**
 * @title Electric Vehicles Charging marketplace for car owners and service providers
 * @author Kejitan Dontas <kejee456@gmail.com> 
 * @notice Adapted from https://github.com/sapph1re/flight-tickets.git : **Roman Vinogradov** 
 * 
 */
contract EVcharging is Ownable, usingOraclize {

  event LogConstructorInitiated(string nextStep);
  event LogPriceUpdated(string price);
  event LogNewOraclizeQuery(string description);

  // SafeMath is a library that allows overflow-safe arithmetic operations
  // Used like this: a.add(b) or a.mul(b) where a & b are uint256
  using SafeMath for uint256;

  struct EVutility {
    // Unique autoincremented EV utility ID
    uint256 uId;
    // Unique evUtility name
    bytes32 uName;
    // Ethereum address of the owner who will manage this evUtility
    address  payable uOwner;
    // IPFS hash of the evUtility logo image
    string uLogo;
  }

  
  struct EVstation {
    // ID of the evUtility that owns this evStation
    uint256 uId; 
    // Unique autoincremented EV station ID
    uint256 sId;  
    // Station Name
    bytes32 stationName;
    // city
    bytes32 city;
    bytes32 chargerType;
    
  }

  enum SlotState {
    Ready,
    Paid
  }
  struct Slot {

    // ID of the evUtility that owns this evStation
    uint256 uId; 
    // Unique autoincremented ID
    uint256 sId;  
    // Unique autoincremented ID
    uint256 slotId;  
    bytes32 customerName;
    // arrival and departure times of vehicle, UTC
    uint256 tArrival;
    uint256 tDeparture;
    // charge required for the vehicle
    uint256 tKWH; // Wh requested
    // station occupation charge rate 
    uint256 tLocationRate; // Depends on LOcation (xGrid, yGrid), time and time duration// From Oracle
    // energy charging rate per wHour 
    uint256 tEnergyRate; // Demand response determned rate from Oracle
    // Slot amount in wei
    uint256 tPrice;
    bool paid;  // Paid .. (Ready initially)
  }

  // Auxiliary entity to keep a reference to a particular entry in an array
  struct ArrayIndex {
    bool exists;
    uint256 index;
  }
  
  // Storage of evUtilities
  EVutility[] public evUtilities;  // The list of evUtilities
  uint256 public uIdLast;  // Last evUtility ID generated, used for autoincrementing
  mapping(uint256 => ArrayIndex) private evUtilityIdIndex;  // Index to find evUtility by its ID evUtilityIdIndex[uId]
  mapping(bytes32 => bool) private evUtilityNameExists;  // To keep track of which evUtilities names are taken

  // Storage of evStations
  EVstation[] public evStations;  // The list of evStations
  uint256 public sIdLast;  // Last evStation ID generated, used for autoincrementing
  mapping(uint256 => ArrayIndex) private sIdIndex;  // Index to find evStation by its ID
  mapping(bytes32 => bool) private evStationNameExists;  // To keep track of which evUtilities names are taken
  mapping(uint256 => uint256[]) private evStationsByEVutility;  // To find list of evStations IDs by their EVutility ID
  // The following is a two-dimensional index to find a certain entry in an array evStationsByEVutility[uId]
  mapping(uint256 => mapping(uint256 => ArrayIndex)) private evStationsByEVutilityIndex; //evStationsByEVutilityIndex[uId][tId]

  // Storage of slots
  Slot[] public slots;  // The list of slots  // Slots in general will not be removed..  So Id and index will be the same?
  uint256 public slotIdLast;  // Last slot ID generated, used for autoincrementing
  mapping(uint256 => ArrayIndex) private slotIdIndex;  // Index to find slot by its ID
  mapping(uint256 => uint256[]) private slotsByEVstation;  // To find list of slots IDs by their EVstation ID
  // The following is a two-dimensional index to find a certain entry in an array evStationsByEVutility[uId]
  mapping(uint256 => mapping(uint256 => ArrayIndex)) private slotsByEVstationIndex;

  uint256 public paymentIdLast;

  // When an evUtility in the list is added, changed or deleted
  event LogEVutilityAdded(uint256 indexed uId, bytes32 indexed uName, address  payable uOwner, string uLogo);
  event LogEVutilityUpdated(uint256 indexed uId, bytes32 newUName, address  payable newUOwner, string newULogo);
  event LogEVutilityRemoved(uint256 indexed uId);
  // When evStation is added, changed or deleted
  event LogEVstationAdded(
    uint256 uId, 
    uint256 indexed sId,
    bytes32 city,
    bytes32 stationName,
    bytes32 chargerType

  );
  event LogEVstationUpdated(
    uint256 indexed sId,
    bytes32 city,
    bytes32 stationName,
    bytes32 chargerType
  );
  
  event LogSlotPaid(  // Check this out   kejitan
    uint256 indexed paymentId,
    address indexed customer,
    uint256 indexed uId,
    uint256 sId, 
    bytes32 customerName,
    uint256 tPrice,
    uint256 tArrival, 
    uint256 tDeparture );

  /**
   * @dev Make sure the caller is the owner of the evUtility
   * @param _uId The evUtility ID
   */
  modifier onlyEVutilityOwner(uint256 _uId) {
    require(evUtilityIdIndex[_uId].exists, "EV Utility does not exist");
    require(evUtilities[evUtilityIdIndex[_uId].index].uOwner == msg.sender, "Not the evUtility owner");
    _;
  }

  /**
   * @dev Make sure the caller is the owner of the evStation
   * @param _sId The evStation ID
   */
  modifier onlyEVstationOwner(uint256 _sId) {
    // find the evStation
    require(sIdIndex[_sId].exists, "EVstation does not exist");
    EVstation memory evStation = evStations[sIdIndex[_sId].index]; // Why should these be memory and not memory ?? Check out kejitan
    // find the evUtility
    require(evUtilityIdIndex[evStation.uId].exists, "EVutility does not exist anymore");
    EVutility memory evUtility = evUtilities[evUtilityIdIndex[evStation.uId].index];
    // make sure the caller is the owner of the evUtility the evStation belongs to
    require(evUtility.uOwner == msg.sender, "Not the evStation owner");
    _;
  }

 
  /** We don't want to accept payments without booking a specific evStation */
  function () external payable {
    revert("Plain payments not accepted");
  }

  //string public ETHUSD;
  //mapping(bytes32=>bool) validIds;
  //mapping (bytes32 => bool) public pendingQueries;  

  /**
   * @notice Pay for a slot
   * @param _sId evStation ID
   * @param _customerName customer name
   * @param _arrival  arrival time
   * @param _departure  departure time
   * @param _KWH  Kilo Watt Hours (energy)
  */
  function paySlot(
      uint256 _sId, 
      bytes32 _customerName,
      uint256 _arrival, 
      uint256 _departure, 
      uint256 _KWH)
    public
    payable
  {
    // Find the evStation to which the slot belongs
    require(sIdIndex[_sId].exists, "evStation does not exist");
    EVstation storage evStation = evStations[sIdIndex[_sId].index];
    // Find the evUtility that owns it
    require(evUtilityIdIndex[evStation.uId].exists, "EVutility does not exist");
    EVutility storage evUtility = evUtilities[evUtilityIdIndex[evStation.uId].index];
  
    //uint256 tPrice = tLocationRate*(_departure - _arrival) + tEnergyRate*_KWH;
    uint256 tPrice = getCost(_sId, _arrival, _departure, _KWH);
    require(msg.value >= tPrice, "Insufficient funds"); 
     
      // Save information about the purchase
      uint256 paymentId = paymentIdLast.add(1);
      paymentIdLast = paymentId;
    
      uint256 slotId = slotIdLast.add(1);
    
      //slots.push(slot);
      uint256 _index = slots.push(Slot (
        evStation.uId,
        _sId, 
        slotId,  
        //msg.sender,
        _customerName,
        _arrival,
        _departure,
        _KWH,
        getLocationRate(_sId), 
        getEnergyRate(_sId), 
        tPrice,
        true )) - 1;

      slotIdIndex[slotId].exists = true;
      slotIdIndex[slotId].index = _index;

      // Send the money to the evUtility owners
      evUtility.uOwner.transfer(tPrice);
    
    // Send back the change if there is anything left
    if ((msg.value - tPrice) > 0) {
      msg.sender.transfer(msg.value - tPrice);
    }

    emit LogSlotPaid( paymentId, msg.sender, evStation.uId, evStation.sId,  
                      _customerName, tPrice, _arrival, _departure);
 }

  /**
   * @notice Location rate of the station where the vehicle is charged. Do it via Oracle
   * @param _sId evStation ID.
  */
   function getLocationRate(uint256 _sId)
    public pure returns (uint256) {
      // Oraclize and get rate and calulate cost abd return
      //EVstation memory evStation =  evStations[sIdIndex[_sId].index];
      _sId++;
      return 10000000000000;
    }

  /**
   * @notice Energy rate of the station where the vehicle is charged. Do it via Oracle
   * @param _sId evStation ID.
  */
   function getEnergyRate(uint256 _sId)
    public pure returns (uint256) {
      // Oraclize and get rate and calulate cost abd return
      //EVstation memory evStation =  evStations[sIdIndex[_sId].index];
      _sId++;
      return 3000000000000000;
    }
 
  /**
   * @notice Calculate cost of charging the vehicle.
   * @param _sId evStation ID.
   * @param _arrival  arrival time
   * @param _departure  departure time
   * @param _KWH Kilo Watt Hours (energy)
  */
  function getCost(uint256 _sId, uint256 _arrival, uint256 _departure, uint256 _KWH)
    public pure returns(uint256) {
    uint256 locationRate = getLocationRate(_sId);
    uint256 interval = _departure.sub(_arrival);
    uint256 locationCost = locationRate.mul(interval);
    uint256 energyRate = getEnergyRate(_sId);
    uint256 energyCost = energyRate.mul(_KWH);
    uint256 cost = locationCost.add(energyCost);
    return cost; 
  }
  
  /**
   * @notice Check if the evUtility name is taken or not
   * @dev Useful for input validation both in the contract and in the frontend
   * @param _uName Name to check
   * @return true if name exists, false otherwise
   */
  function evUtilityExists(bytes32 _uName) public view returns (bool) {
    return evUtilityNameExists[_uName];
  }

  /**
   * @notice Get the number of evUtilities stored
   * @dev Use it in the frontend to iterate over evUtilities
   * @return The number of evUtilities
   */
  function getEVutilityCount() public view returns (uint256) {
    return evUtilities.length;
  }

/**
   * @notice Get the number of evStations stored
   * @dev Use it in the frontend to iterate over evStations
   * @return The number of evStations
   */
  function getEVstationCount() public view returns (uint256) {
    return evStations.length;
  }

/**
   * @notice Get the number of evStations stored for given uId (evUtility)
     @param uId Id of evUtility for which the the number of stations are required
   * @dev Use it in the frontend to iterate over evStations
   * @return The number of evStations
   */
  function getEVstationCount(uint256 uId) public view returns (uint256) {
    uint256 numEVstations = 0;
    for(uint256 i; i < evStations.length; i++) {
      //EVstation evStation = evStations[i];
      if ( uId == evStations[i].uId) 
        numEVstations++;
    }
    return numEVstations;
  }

  /**
   * @notice Get a certain evUtility by its ID
   * @param _uId ID of the evUtility
   * @return EVutility data
   */
  function getEVutilityById(uint256 _uId) public view returns(
    uint256 uId,
    bytes32 uName,
    address payable  uOwner,
    string memory uLogo
  ) {
    require(evUtilityIdIndex[_uId].exists, "EVutility does not exist");
    EVutility memory evUtility = evUtilities[evUtilityIdIndex[_uId].index];
    return (evUtility.uId, evUtility.uName, evUtility.uOwner, evUtility.uLogo);
  }

  /**
   * @notice Get the number of evStations from a given evUtility
   * @dev Use it in the frontend to iterate over evStations by evUtility
   * @param _uId ID of the evUtility
   * @return The number of evStation owned by the evUtility
   */
  function getEVstationsCount(uint256 _uId) public view returns (uint256) {
    require(evUtilityIdIndex[_uId].exists, "EVutility does not exist");
    return evStationsByEVutility[_uId].length;
  }
 
  /**
   * @notice Get a certain evStation by its ID
   * @param _sId ID of the evStation
   * @return EVstation data
   */
  function getEVstationById(uint256 _sId)
    public
    view
    returns(
      uint256 uId,
      uint256 sId,
      bytes32 city,
      bytes32 stationName,
      bytes32 chargerType
    )
  {
    require(sIdIndex[_sId].exists, "EVstation does not exist");
    EVstation memory evStation = evStations[sIdIndex[_sId].index];
    return (
      evStation.uId,
      evStation.sId,
      evStation.city,
      evStation.stationName,
      evStation.chargerType
    );
  }
 
   /**
   * @notice Get a certain slot by its ID
   * @param _slotId ID of the slot
   * @return Slot data
   */
  function getSlotById(uint256 _slotId)
    public
    view
    returns (Slot memory) 
  {
    require(slotIdIndex[_slotId].exists, "Slot does not exist");
    Slot memory slot = slots[slotIdIndex[_slotId].index];
    return slot;
  }

  /**
   * @notice Get N-th evStation of a given evKioiskChain
   * @param _uId ID of the evKioiskChain
   * @param _index Index of the item to get (the N)
   * @return EVstation data
   */
  function getEVstationByEVutility(uint256 _uId, uint256 _index)
    public
    view
    returns (
      uint256,
      uint256,
      bytes32,
      bytes32,
      bytes32 
    )
  {
    uint256 sId = evStationsByEVutility[_uId][_index];
    return getEVstationById(sId);
  }

  //event testFindVacantEVStations(bytes32 _city, bytes32 _ctype, uint256 _arrival, uint256 _departure );

  /**
   * @notice Finds evStations where charging slots are vacant at desired time
   * @param _city  city
   * @param _ctype  charger type
   * @param _arrival  arrival time
   * @param _departure  departure time
   * @return array of evStations where slot is vacant at desired time.
   */
  function findVacantEVStations(bytes32 _city, bytes32 _ctype, uint256 _arrival, uint256 _departure )
    public view returns(uint256[20] memory ) {
      //emit testFindVacantEVStations(_city, _ctype, _arrival, _departure );
      //console.log("in findVacantEVStations");
      uint256 maxEVStationsFound = 20;
      uint256[20] memory evStationsFound;
      uint256[20] memory vacantEVStations;

      uint256 i = 0; //evStationsFound counter
      uint256 j = 0;  //evStations counter
      uint256 k = 0;  //vacantStations Counter
    
      for (j = 0; j < evStations.length; j++) {
        EVstation memory evStation = evStations[j];
        //EVstation memory evStation = getEVstationById(j);
    
        if (evStation.city == _city &&
          evStation.chargerType == _ctype) {
            evStationsFound[i++] = evStation.sId;
            if (i == maxEVStationsFound) {
              break;
           }          
        }
      }
      
      uint256 newEVStationsFound = i;
      
      for (uint256 m = 0; m < newEVStationsFound; m++) {
        if (isStationVacant(evStationsFound[m], _arrival, _departure)) {
          vacantEVStations[k] = evStationsFound[m];
          k++;
        }
      }
      
      return vacantEVStations;
    }

  /**
   * @notice Tests if evStation is vacant at given time
   * @param _sId  evStation Id
   * @param _arrival  arrival time
   * @param _departure  departure time
   * @return bool.
   */
  function isStationVacant(uint256 _sId, uint256 _arrival, uint256 _departure) 
    public view returns (bool){

    uint256[1024] memory slotsFound;
    uint256 i = 0;
    uint256 numSlotsFound = 0;

    // need to select slots for the station and 
    for (uint256 j = 0; j < slots.length; j++) {
      //Slot memory slot = getSlotById(slotId);
      //Slot memory slot = slots[slotIdIndex[slotId].index];
      Slot memory slot = slots[j];

      if (slot.sId == _sId ) {
            slotsFound[i++] = slot.slotId;
            numSlotsFound++;
            if (numSlotsFound == 1024) break;
      }
    }

     for (uint256 k = 0; k < numSlotsFound; k++) {
        uint256 slotId = slotsFound[k];
        Slot memory aslot = getSlotById(slotId);
        //Slot memory aslot = slots[slotIdIndex[slotId].index];
        //Slot memory aslot = slots[slotId];
        if(
            ( (_arrival >= aslot.tArrival) &&
              (_arrival <= aslot.tDeparture)
            ) || 
            ( (_departure >= aslot.tArrival) &&
              (_departure <= aslot.tDeparture)
            ) || 
            ( (aslot.tArrival >= _arrival) &&
              (aslot.tArrival <= _departure)
            ) || 
            ( (aslot.tDeparture >= _arrival) &&
              (aslot.tDeparture <= _departure)
            ) 
        ) { 
            return false;
          }
    }    
        
    return true;

  }


  /**
   * @notice Add an EVutility to the list
   * @dev 
   * @param _uName Name of the evUtility, must be unique (transaction will fail otherwise)
   * @param _uOwner Address of the evUtility owner, can be any Ethereum address
   * @param _uLogo Logo of the evUtility
   */
  function addEVutility(bytes32 _uName, address  payable _uOwner, string memory  _uLogo) public onlyOwner {
    require(!evUtilityExists(_uName), "evUtility name is already taken");
    // generate new evUtility ID
    uint256 _uId = uIdLast.add(1);
    uIdLast = _uId;
    // add a new EVutility record to evUtilities array and save its index in the array
    uint256 _index = evUtilities.push(EVutility(_uId, _uName, _uOwner, _uLogo)) - 1;
    evUtilityIdIndex[_uId].exists = true;
    evUtilityIdIndex[_uId].index = _index;
    // occupy the evUtility
    evUtilityNameExists[_uName] = true;
    emit LogEVutilityAdded(_uId, _uName, _uOwner, _uLogo);
  }

  /**
   * @notice Change an existing evStationChevUtilityain
   * @param _uId ID of the evUtility that is being changed (ID itself does not change)
   * @param _newUName New name of the evUtility, must be unique or remain unchanged
   * @param _newUOwner New owner of the evUtility
   * @param _newULogo New logo of the evUtility
   */
  function editEVutility(uint256 _uId, bytes32 _newUName, address payable  _newUOwner, string memory _newULogo)
    public
    onlyOwner
  {
    require(evUtilityIdIndex[_uId].exists, "EVutility does not exist");
    // get index of the array element being changed
    uint256 _index = evUtilityIdIndex[_uId].index;
    // if the name has changed, check it's unique and save it
    if (_newUName != evUtilities[_index].uName) {
      require(!evUtilityExists(_newUName), "New evUtility name is already taken");
      // free the old name, occupy the new one
      evUtilityNameExists[evUtilities[_index].uName] = false;
      evUtilityNameExists[_newUName] = true;
      evUtilities[_index].uName = _newUName;
    }
    // simply update the owner and the logo
    evUtilities[_index].uOwner = _newUOwner;
    evUtilities[_index].uLogo = _newULogo;
    emit LogEVutilityUpdated(_uId, _newUName, _newUOwner, _newULogo);
  }

  
  /**
   * @notice Add an evStation to the list
   * @dev Use the emitted LogEVstationAdded event to get the new evStation's generated ID
   * @dev further the evStation must belong to the evUtility -- how to ensure this?
   * @param _uId ID of the evUtility; the evUtility must be owned by the caller!
   * @param _stationName Name of the evStation
   * @param _city city where the evStation is located
   * @param _chargerType Charger bytes32 of the evStation
   */
  function addEVstation(
    uint256 _uId,
    bytes32 _city,
    bytes32 _stationName,
    bytes32 _chargerType
  ) public onlyEVutilityOwner(_uId) {
    // generate new evStation ID
    uint256 sId = sIdLast.add(1);
    sIdLast = sId;
   // add a new evStation record to evStations array and save its index in the array
    EVstation memory evStation = EVstation(
      _uId,
      sIdLast,
      _stationName,
      _city,
      _chargerType
    );
    uint256 _index = evStations.push(evStation) - 1;
    sIdIndex[sIdLast].exists = true;
    sIdIndex[sIdLast].index = _index;
    // add the evStation ID to the list of this evUtility's evStations
    uint256 _index2 = evStationsByEVutility[_uId].push(sIdLast) - 1;
    // and save the index of this entry too, to be able to manage it later
    evStationsByEVutilityIndex[_uId][sIdLast].exists = true;
    evStationsByEVutilityIndex[_uId][sIdLast].index = _index2;
    emit LogEVstationAdded(
      _uId,
      sIdLast,
      _stationName,
      _city,
      _chargerType
    );
  }

  /**
   * @notice Change an existing evStation
   * @param _sId ID of the evStation that is being changed (ID itself does not change)
   * @param _stationName name of the evStation
   * @param _newType New Charger type for the evStation
   */
  function editEVstation(uint256 _sId, bytes32 _city, bytes32 _stationName, bytes32 _newType)
    public
    onlyEVstationOwner(_sId)
  {
    // update the evStation data -- kejitan -- retetrieve proper evStation
    uint256 _index = sIdIndex[_sId].index;
    evStations[_index].city = _city;
    evStations[_index].stationName = _stationName;
    evStations[_index].chargerType = _newType;
    emit LogEVstationUpdated(_sId, _city, _stationName,  _newType);
  }

  
}

  //constructor () public payable {
    //oraclize_setCustomGasPrice(4000000000);
    //oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
    //emit LogConstructorInitiated("Constructor was initiated. Call 'updatePrice()' to send the Oraclize Query.");
  // }
/*
  function __callback(bytes32 myid, string memory  result) public {
    //if (!validIds[myid]) revert();
    //if (msg.sender != oraclize_cbAddress()) revert();
    require (pendingQueries[myid] == true, "pendingQueries[myid] == true");
    ETHUSD = result;
    emit LogPriceUpdated(result);
    delete validIds[myid];
    delete pendingQueries[myid]; // This effectively marks the query id as processed.
    //updatePrice();
  }

  function updatePrice() public payable {
    //if (oraclize_getPrice("URL") > this.balance) {
    if (oraclize_getPrice("URL") > uint256(1000000000000000)) {
      emit LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
    } else {
      emit LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
      bytes32 queryId =
        oraclize_query("URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price");
      validIds[queryId] = true;
      pendingQueries[queryId] = true;

    }
  }
*/
  //oraclize_query("URL", "https://api.kraken.com/0/public/Ticker?pair=ETHXBT")

  //oraclize_query("URL", "json(https://www.therocktrading.com/api/ticker/BTCEUR).result.0.last")

  // The URL datasource also supports a supplement argument, useful for creating HTTP POST requests.
  // If that argument is a valid JSON string, it will be automatically sent as JSON.
  //oraclize_query("URL", "json(https://shapeshift.io/sendamount).success.deposit",
  //  '{"pair":"eth_btc","amount":"1","withdrawal":"1AAcCo21EUc1jbocjssSQDzLna9Vem2UN5"}')

