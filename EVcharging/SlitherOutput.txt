(slither-dev) kejitan@consensys18-04:~/Desktop/SlitherTest$ slither --exclude-informational contracts
INFO:Slither:Compilation warnings/errors on contracts/EVcharging.sol:
contracts/EVcharging.sol:3:1: Warning: Experimental features are turned on. Do not use experimental features on live deployments.
pragma experimental ABIEncoderV2;
^-------------------------------^
contracts/EVcharging.sol:289:29: Warning: Unused function parameter. Remove or comment out the variable name to silence this warning.
   function getLocationRate(uint256 _sId)
                            ^----------^
contracts/EVcharging.sol:300:27: Warning: Unused function parameter. Remove or comment out the variable name to silence this warning.
   function getEnergyRate(uint256 _sId)
                          ^----------^
installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol:371:5: Warning: Function state mutability can be restricted to pure
    function __callback(bytes32 _myid, string memory _result, bytes memory _proof) public {
    ^ (Relevant source part starts here and spans across multiple lines).
contracts/EVcharging.sol:289:4: Warning: Function state mutability can be restricted to pure
   function getLocationRate(uint256 _sId)
   ^ (Relevant source part starts here and spans across multiple lines).
contracts/EVcharging.sol:300:4: Warning: Function state mutability can be restricted to pure
   function getEnergyRate(uint256 _sId)
   ^ (Relevant source part starts here and spans across multiple lines).

INFO:Detectors:
EVcharging.slotIdLast (EVcharging.sol#103) is never initialized. It is used in:
	- paySlot (EVcharging.sol#227-283)
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#uninitialized-state-variables
INFO:Detectors:
slotsFound in EVcharging.isStationVacant (EVcharging.sol#511) is a local variable never initialiazed
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#uninitialized-local-variables
INFO:Detectors:
len in usingOraclize.uint2str (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#1077-1079) is a local variable never initialiazed
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#uninitialized-local-variables
INFO:Detectors:
buf in usingOraclize.stra2cbor (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#1086) is a local variable never initialiazed
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#uninitialized-local-variables
INFO:Detectors:
evStationsFound in EVcharging.findVacantEVStations (EVcharging.sol#469) is a local variable never initialiazed
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#uninitialized-local-variables
INFO:Detectors:
buf in usingOraclize.ba2cbor (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#1094) is a local variable never initialiazed
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#uninitialized-local-variables
INFO:Detectors:
vacantEVStations in EVcharging.findVacantEVStations (EVcharging.sol#470) is a local variable never initialiazed
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#uninitialized-local-variables
INFO:Detectors:
i in EVcharging.getEVstationCount (EVcharging.sol#356) is a local variable never initialiazed
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#uninitialized-local-variables
INFO:Detectors:
CBOR.encodeType (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#215-233) does not use the value returned by external calls:
	-_buf.appendInt(_value,1) (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#221)
	-_buf.appendInt(_value,2) (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#224)
	-_buf.appendInt(_value,4) (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#229)
	-_buf.appendInt(_value,8) (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#233)
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#unused-return
INFO:Detectors:
CBOR.encodeBytes (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#250-255) does not use the value returned by external calls:
	-_buf.append(_value) (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#255)
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#unused-return
INFO:Detectors:
CBOR.encodeString (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#255-260) does not use the value returned by external calls:
	-_buf.append(bytes(_value)) (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#260)
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#unused-return
INFO:Detectors:
Buffer.init (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#91-105) is declared view but contains assembly code
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#constant-functions-changing-the-state
INFO:Detectors:
Buffer.append (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#125-157) is declared view but contains assembly code
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#constant-functions-changing-the-state
INFO:Detectors:
Buffer.append (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#165-178) is declared view but contains assembly code
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#constant-functions-changing-the-state
INFO:Detectors:
Buffer.appendInt (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#185-205) is declared view but contains assembly code
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#constant-functions-changing-the-state
INFO:Detectors:
usingOraclize.getCodeSize (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#872-876) is declared view but contains assembly code
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#constant-functions-changing-the-state
INFO:Detectors:
usingOraclize.copyBytes (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol#1263-1282) is declared view but contains assembly code
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#constant-functions-changing-the-state
INFO:Detectors:
usingOraclize.safeMemoryCleaner (installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol) is declared view but contains assembly code
Reference: https://github.com/trailofbits/slither/wiki/Vulnerabilities-Description#constant-functions-changing-the-state
INFO:Slither:contracts/Migrations.sol analyzed (10 contracts), 18 result(s) found

