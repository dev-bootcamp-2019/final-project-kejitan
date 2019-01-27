# Electric Vehicle Charging

Ethereum-based decentralized application that allows Electrical Utilities to reserve Electric Vehicles charging slots to customers via smart contracts and manages payments between the parties in cryptocurrency.

## Table of content

- [Demo in Rinkeby](#demo-in-rinkeby)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [How to run it](#how-to-run-it)
- [Testing](#testing)
- [Security](#security)
- [Design pattern decisions](#design-pattern-decisions)
- [Author](#author)

## Demo in Rinkeby

Contracts are deployed in Rinkeby testnet. Contract addresses in Rinkeby are listed in `deployed_addresses.txt`.

The UI is available here:
  
* IPFS directly: Takes long time to load and has not been tried
* Traditionally hosted: https://kejitan.github.io/EVcharging/

Check the *Play around* block in the [How to run it](#how-to-run-it) section to get an idea of what you can do.

Sample data is deployed with cities: Mumbai, Bangkok, Hong Kong, Delhi.

Check it out, try booking. If you need test ether in Rinkeby, use the [faucet](https://faucet.rinkeby.io/) to get some and come back.

On Rinkeby network (https://kejitan.github.io/EVcharging/) you will not have Admin or EVutility roles. You can book slots on the existing EVstatioins as a regular customer. You can test full functionality in the development mode (Decsribed below in "How to run it").

## Architecture

Admin can add/edit EVutilities. Each EVutility has:
* Unique autoincremented ID
* Unique name
* Logo: an image uploaded to IPFS and its hash stored in the contract
* Owner: an Ethereum address

EVutility owner can add EV charging stations. Each EVstation has:
* Unique autoincremented ID
* EVutility ID: a reference to the EVutility that owns this EVstation
* City - where the EVstation is located
* Station Name -  Name of the EVstation
* Charger Type - Either Level2 or DC - Should have provided Radio Button

* Arrival: Local timestamp of Charging start time
* Departure: Local timestamp of charging end time

Any user can search for Charging Slot in a City A from Start to End time on a given day for a required Charger Type. The system will find all EVstations that are free for the duration of Charging Slot.

Found Charging Slots are sorted by price.

User pay for the Charging Slot that they found, which involves entering Customer Name and sending a payment. The UI sends a precise payment amount to cover the ticket(s) being purchased, but if a user interacts with the contract directly and sends any excessive ether, the change will be returned to them. Sending insufficient ether will revert the transaction and nothing will happen. The payments are instantly forwarded to the owner of the EVstation (EVutility) per each Charging Slot booked.

Payment history is stored in the event logs.

Users can find the history of Charging Slots they paid for in *My Payments*.

EVutility owners can find the history of Charging Slots they sold in *My EVutilities* > *Sold Slots*.

Cost of the Ev charging slot is based on kWH and duration of time requested by the following formula. The time is in seconds, and is given in wei. 
cost in wei = 10000000000000*duration (insecond) + 3000000000000000*kWH

It was intended to use URL query for Oracle that would calculate the cost based on EV station ID since the location parking rates and energy rates are expected to be based on location. However, I did not have time to implement Oracle.

The main contract is `EVcharging`, implemented in *Solidity*. It uses `SafeMath` library base contract provided by Zeppelin. Zeppelin package code is updated manually from their github and the used files are saved to the repository.

Another contract, `FlightTicketsRegistry` is directy taken from Flight Tickets project by Roman Vinogradov. Its bytecode and ABI are saved manually to `/build/contracts/FlightTicketsRegistry.json`.

## Prerequisites

* The project has been implemented on VirtualBox running Ubuntu 16.04.5

* NodeJS 10.15.0
* npm 6.4.1
* truffle 5.0.2
* ganache-cli 6.2.5
* Solidity 0.5.2
* web3 1.0
* browser with MetaMask connected to ganache-cli

## How to run it

Please refer to the following document for test set up.

[Read here](Test-setup.md)


Play around. Try searching & buying tickets.

Sample data provides EV Charging Stations in Mumbai, Bangkok, Hong Kong, and also in Delhi in case of application on Rinkeby network (https://kejitan.github.io/EVcharging/). 

Results are sorted either by price.

Try booking (paying for) EV charging stations that you find. Press "Book", enter customer's name press "Pay Now" and confirm the transaction with MetaMask. Then you can go to "My Payments" and see the EV charging station that you have booked.

The logic for Booking EV stations charging slots is as follows. 
From Search Charging Slots tab, enter City where you would like to charge your vehicle. Also enter Charger Type required (DC or Level2) together with estimates kWH (kilo watt hours) required and the time slot (from time, to time). If there are EV station in the desired city with required charter type that is free durinf the requested time slot, they will be listed in the table. Choose an EV station of choice and press Book to initiate Booking process. This will open up a Payment Dialog. Enter Customer Name and press Pay Now button. The Metamask confirmation tab will open. Confirm the transaction. Verify the transaction by going to My Payments tab. You will see this entry added to the already exiting list of payments.
 
There is a bug in the user interface that causes a payment entry to be listed 5 times in the window. There is only eingle entry in the system, and the 5 entries show as a single entry if the Account in Metamask is switched to another account , some tab is clivcked and then account in Metamaskis restored to the original one. Now it show a single payment entry.

Suppose you book a slot in the city Delhi, in the EV station named Delhi-cantonement, for January 31, from 12:00 to 14:00 hours, and if you or someone makes a search for a charging slot for a period that *overlaps* period January 31, from 12:00 to 14:00 hours, the EV station named Delhi-cantonement will not be shown in the list of available EV stations in the Search Charging Slots results. 

With an EV utility owner's account, you can go to "My EVutility" and see the EV stations that have been paid by customers. You can see those ones you just bought, but make sure you log in with the proper EV utility. Also check your ETH balance, you'll have the revenue from booking the EV stations.

The first ganache address is the owner of the contract and the admin of the dapp. If you login in to MetaMask with it, you will see the admin panel in the menu. The first address also owns one EV utility (if 'npm run populate' has been executed). Two more EV utilities are owned by the second ganache's address and one EV utility by the third address. When you're logged in to MetaMask with an address that owns an EV utility, you will see EV utility panel in the menu.

Currently there is no provision to delete EVstations and EVutilities from the system.

Feel free to play around with EV utilities and their owners in the admin panel, as well as with the EV stations of your EV utilities in the airline panel. You may add more EV stations in exiting or new cities and then try finding and buying them in the "Search Charging Slots" tab.

Every EV utiliti has a logo, which is stored in IPFS. Sample data has logos uploaded from the `sample-images` directory. You can try updating logos of existing EV utilites or setting logos to new EV utilities that you can add from the Admin Panel..

Pause/unpause the contract is not implemented as I encountered problems in the Pausable.sol contract from OpenZeppelin that was written for Solidity 0.5.2. 

## Testing

The tests cover:
* ownership of the contract and authorization of access
* add/edit operations for EV utilities abd add for EV stations
* verification of the data stored
* input data validation
* searching for Charging Slots
* Paying for Charging Slots (EV stations at required time)

To run the tests:
```
truffle test
```

The contracts deployed in Rinkebt testnet we verified by entering contract address (in deployed_addresses.txt) and ABI code to myetherwallet.com/#contracts

Smart Check was used to test the contracts
The contract files were upoloaded to https://tool.smartdec.net/. Some issues are present but they are not severe.

Slither was used to test the contracts
This was done in a a virtual machine runniong Ubuntu 18.04.1. This is because slither has problms with Python 3.5.2 that is native to Ubuntu 16.04.5
The tests did not report severe issues. The output can be seen at  [Read here](SlitherOutput.txt)

Mythril
This package too needs Python 3.6+ So this was tried on Python Ubuntu 18.04.1. However, it required Truffle 4. I need Solidity 0.5.2 for OpenZeppelin contracts to work properly. I tried Solc-js 0.5.2 from Truffle 4 environment. However mythril --truffle complained that it requires Truffle 4. So abandoned further efforts.

## Security

[Read here](avoiding_common_attacks.md)


## Design pattern decisions

[Read here](design_pattern_decisions.md)

## Author
* **Kejitan Dontas** 
* based on Flight Tickets project by **Roman Vinogradov** - [sapph1re](https://github.com/sapph1re)
