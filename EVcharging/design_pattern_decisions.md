## Design pattern decisions

### Fail early and fail loud

Most of the contract functions perform `require()` checks in the beginning, reverting if anything is wrong with the input data. 

### Restricting access

Modifiers `onlyOwner`, `onlyEVutilityOwner` and `onlyEVstationOwner` implement access restriction, making sure that only those are able to change the relevant data who are supposed to be. This behavior is covered by the tests.


