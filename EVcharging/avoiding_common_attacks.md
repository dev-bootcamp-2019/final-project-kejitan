## Security

### User rights

Execution of contract functions is only available to those who have rights for it. The rights a user may have:
* search & book EV Charging Slots: anyone
* add EV stations of an EV utility: only the owner of that EV utility
* add/edit EV utilities: only the admin (the owner of the contract)

These access restrictions are implemented in modifiers `onlyOwner`, `onlyEVutilityOwner` and `onlyEVstationOwner`.

### Overflow protection

`SafeMath` library is used to perform arithmetic operations that are otherwise vulnerable to overflowing or underflowing. The library implements checking if the operation has overflown/underflown and throws if it has, so such a transaction will not go through. For example, it is used in getCost() function in EVcharging.sol contract.

### Re-entrancy protection

Only `.transfer()` is used to send ether, which does not provide enough gas to execute any code.

All ether transfers are performed in the end of the functions, after all important state changes are made.

When user pays for a Charging Slot, the payment is forwarded to the EV utility owner address, which is set by admin. Thus EV utility owner addresses are considered trusted to be external addresses and not contract addresses. Otherwise the worst case is that the transaction will revert and the purchase will not be made.

The only completely untrusted address to receive money from the contract is the Charging Slot customer himself, whenever he sends an excessive amount of ether. In this case he will get the change back, in the end of the payment operation. Again, with `.transfer()` being used, the worst thing a malicious user can do with the provided gas is only to revert, thus failing the whole transaction and not changing anything in the contract state at all.

### Contract balance

The contract is not supposed to store any ether, because it only forwards the payments from a buyer to the airline. The contract does not rely nor count its own balance. The fallback function always reverts. 



