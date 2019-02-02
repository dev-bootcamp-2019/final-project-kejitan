# Test setup for EVcharging Application

* If you do not have TRuffle 5 installed, I recommend setting up the project (EVcharging) in virtual environment
* My project uses Truffle 5.0.2, Solidity 0.5.2, web3 1.0 and will give compilation/execution errors on Truffle 4 set up
* The following instructions are for Ubuntu
* If your OS is different, you may try VirtualBox Ubuntu 16.04.5 set up

#Install virtualenv if not already installed
### $ cd ~
### $ sudo apt-get install python3-pip
### $ pip3 install virtualenv
### alternatively sudo apt-get install virtualenv

#Create virual environment
### $ virtualenv eval-truffle5
### $ source ~/eval-truffle5/bin/activate
### $ cd ~/eval-truffle5

#From Web browser visit https://nodejs.org download LTS version 10.15.0 in ~/eval-truffle5. Extract node-v10.15.0-linux-x64.tar.xz in the same directory. (if you download node-v10.15.1-linux-x64.tar.xz, please modify paths accordingly)

* To the file /home/username/.bashrc, add the following at the end
* export PATH=~/eval-truffle5/node-v10.15.0-linux-x64/bin:$PATH

#Save the file and open another terminal so that above change takes place

#In the new terminal 
### $ cd ~/eval-truffle5
### $ source ~/eval-truffle5/bin/activate
### (eval-truffle5) $ echo $PATH   
#verify PATH
### (eval-truffle5) $ node -v

#10.15.0
### $npm -v

#6.4.1
### (eval-truffle5) $ npm install -g ganache-cli
### (eval-truffle5) $ ganache-cli

# There is someproblem with date-time widget input inb Firefox. Please open Google chrome.
#If you have not installed metamask, you can add the extension to your browser by visiting https://metamask.io and follow the instructions

#Please set Network to Private Natwork -> Localhost:8545 on Metamask. Export at least 3 accounts from ganache-cli to Metamask

#open anotrher terminal
#While still in ~/eval-truffle5  

### (eval-truffle5) $ npm install -g truffle@5.0.2
### (eval-truffle5) $ which truffle

#Output something like: /home/username/eval-truffle5/node-v10.15.0-linux-x64/bin/truffle

### (eval-truffle5) $ truffle version 
#truffle v5.0.2
#Solidity v0.5.0 (solc-js)
#Node v10.15.0

# Now we are ready to set up the project
### (eval-truffle5) $ git clone https://github.com/dev-bootcamp-2019/final-project-kejitan.git
### (eval-truffle5) $ cd ~/eval-truffle5/final-project-kejitan/EVcharging
### (eval-truffle5): Project directory $ truffle compile

	- Compiling ./contracts/EVcharging.sol...
	- Compiling ./contracts/Migrations.sol...
	- Compiling ./installed_contracts/oraclize/ethereum-api/oraclizeAPI_0.5.sol...
	- Compiling ./installed_contracts/zeppelin/contracts/math/SafeMath.sol...
	- Compiling ./installed_contracts/zeppelin/contracts/ownership/Ownable.sol...

	- Compilation warnings encountered:

	- /home/kejitan/eval-truffle6/final-project-kejitan/EVcharging/contracts/EVcharging.sol:3:1: Warning: Experimental features are turned on. Do not use experimental features on live deployments.
	- pragma experimental ABIEncoderV2;
	- ^-------------------------------^

	- Writing artifacts to ./build/contracts


### (eval-truffle5): Project directory$ truffle migrate --reset

	- If you're using an HDWalletProvider, it must be Web3 1.0 enabled or your migration will hang.


	- Starting migrations...
	- ======================
	- > Network name:    'development'
	- > Network id:      1548589343764
	- > Block gas limit: 6721975


	- 1_initial_migration.js
	- ======================

	-    Replacing 'Migrations'
	-    ----------------------
	-    > transaction hash:    0xf285a35d26018f3d4759a51c392b755dccbb219fc2a841fddb0b6934bd841216
	-    > Blocks: 0            Seconds: 0
	-    > contract address:    0x571B57d7bb6d87C8eC846E79b0EB3cad25aD039e
	-    > account:             0x83cF3d35832e15E9a89233b3a1961e784C07aF05
	-    > balance:             99.47850926
	-    > gas used:            273162
	-    > gas price:           20 gwei
	-    > value sent:          0 ETH
	-    > total cost:          0.00546324 ETH


	-   > Saving migration to chain.
	-   > Saving artifacts
	-   -------------------------------------
	-   > Total cost:          0.00546324 ETH


	- 2_deploy_contracts.js
	- =====================

	-    Replacing 'SafeMath'
	-    --------------------
	-    > transaction hash:    0x51947ab86a1c70b102192422660208570a71338ba0fce28b5637ee99b52950aa
	-    > Blocks: 0            Seconds: 0
	-    > contract address:    0x64B9205160f00bEa929811fFC124073e58B06BaE
	-    > account:             0x83cF3d35832e15E9a89233b3a1961e784C07aF05
	-    > balance:             99.47617118
	-    > gas used:            74876
    -    > gas price:           20 gwei
	-    > value sent:          0 ETH
	-    > total cost:          0.00149752 ETH


	-    Replacing 'EVcharging'
	-    ----------------------
	-    > transaction hash:    0xf3415242967f82cc4f42fb275423161e682bd4d588de50856e5a9ce6cc5a6cb2
	-    > Blocks: 0            Seconds: 0
	-    > contract address:    0x9f3f1FE9Fed9334132a8921686dd6ce93e611922
	-    > account:             0x83cF3d35832e15E9a89233b3a1961e784C07aF05
	-    > balance:             99.395259
	-    > gas used:            4045609
	-    > gas price:           20 gwei
	-    > value sent:          0 ETH
	-    > total cost:          0.08091218 ETH


	-    Replacing 'FlightTicketsRegistry'
	-    ---------------------------------
	-   > transaction hash:    0x8d07918a0a9847d4ebfaad4693872a04c916d1c34f95646f48d8f21fefb7980a
	-   > Blocks: 0            Seconds: 0
	-   > contract address:    0x5c6A46D7Fc26c066A19D91C0aE357647568ff1D7
	-   > account:             0x83cF3d35832e15E9a89233b3a1961e784C07aF05
	-   > balance:             99.390132
	-   > gas used:            256350
	-   > gas price:           20 gwei
	-   > value sent:          0 ETH
	-   > total cost:          0.005127 ETH


	-   > Saving migration to chain.
	-   > Saving artifacts
	-   -------------------------------------
	-   > Total cost:           0.0875367 ETH


	- Summary
	- =======
	- > Total deployments:   4
	- > Final cost:          0.09299994 ETH

### (eval-truffle5): Project directory$ truffle test

- Using network 'development'.

-  Contract: EVcharging
-    ✓ sets the owner
-    ✓ adds an evUtility from the owner (121ms)
-    ✓ confirms that the evUtility exists
-    ✓ does not allow to add an evUtility when the name is taken (67ms)
-    ✓ stores the evUtility data
-    ✓ edits an evUtility (112ms)
-    ✓ does not allow to edit an evUtility when the new name is taken (162ms)
-    ✓ does not allow to add an evStation from a non-owner of the evUtility (88ms)
-    ✓ adds evStations from the owner of the evUtility (240ms)
-    ✓ stores the evStation data
-    ✓ edits an evStation (93ms)
-    ✓ finds a charging slot (736ms)

-  Contract: FlightTicketsRegistry
-    ✓ sets the owner
-    ✓ sets the backend contract address
-    ✓ upgrades the registry to the new backend contract (164ms)
-    ✓ saves the previous backend contract address
-    ✓ does not allow a non-owner to upgrade the registry (396ms)


-  17 passing (3s)


### (eval-truffle5): Project directory$ npm install

-	long output

### (eval-truffle5): Project directory$ npm run populate

-	> EVcharging@0.1.0 populate /home/kejitan/eval-truffle5/final-project-kejitan/EVcharging
-	> node scripts/populate.js

-	Adding evUtility: ChargePoint owned by 0x83cf3d35832e15e9a89233b3a1961e784c07af05...
-	Adding evStation: Bangkok ChargePoint Bangkok1 Level2
-	Adding evStation: Bangkok ChargePoint Bangkok2 Level2
-	Adding evStation: Bangkok ChargePoint Bangkok3 DC
-	Adding evStation: Bangkok ChargePoint Bangkok4 DC
-	Adding evStation: Hong Kong ChargePoint Hong Kong1 Level2
-	Adding evStation: Hong Kong ChargePoint Hong Kong2 Level2
-	Adding evStation: Hong Kong ChargePoint Hong Kong3 DC
-	Adding evStation: Hong Kong ChargePoint Hong Kong4 Level2
-	Adding evStation: Mumbai ChargePoint Mumbai1 Level2
-	Adding evStation: Mumbai ChargePoint Mumbai2 Level2
-	Adding evStation: Mumbai ChargePoint Mumbai3 DC
-	Adding evStation: Mumbai ChargePoint Mumbai4 DC
-	ChargePoint now has 12 evStations.
-	Adding evUtility: Nissan owned by 0x94db54b212b9ff393f865db55051c79b27964d52...
-	Adding evStation: Bangkok Nissan Bangkok1 Level2
-	Adding evStation: Bangkok Nissan Bangkok2 Level2
-	Adding evStation: Bangkok Nissan Bangkok3 DC
-	Adding evStation: Bangkok Nissan Bangkok4 DC
-	Adding evStation: Hong Kong Nissan Hong Kong1 Level2
-	Adding evStation: Hong Kong Nissan Hong Kong2 Level2
-	Adding evStation: Hong Kong Nissan Hong Kong3 DC
-	Adding evStation: Hong Kong Nissan Hong Kong4 Level2
-	Adding evStation: Mumbai Nissan Mumbai1 Level2
-	Adding evStation: Mumbai Nissan Mumbai2 Level2
-	Adding evStation: Mumbai Nissan Mumbai3 DC
-	Adding evStation: Mumbai Nissan Mumbai4 DC
-	Nissan now has 12 evStations.
-	Adding evUtility: GridSpace owned by 0x94db54b212b9ff393f865db55051c79b27964d52...
-	Adding evStation: Bangkok GridSpace Bangkok1 Level2
-	Adding evStation: Bangkok GridSpace Bangkok2 Level2
-	Adding evStation: Bangkok GridSpace Bangkok3 DC
-	Adding evStation: Bangkok GridSpace Bangkok4 DC
-	Adding evStation: Hong Kong GridSpace Hong Kong1 Level2
-	Adding evStation: Hong Kong GridSpace Hong Kong2 Level2
-	Adding evStation: Hong Kong GridSpace Hong Kong3 DC
-	Adding evStation: Hong Kong GridSpace Hong Kong4 Level2
-	Adding evStation: Mumbai GridSpace Mumbai1 Level2
-	Adding evStation: Mumbai GridSpace Mumbai2 Level2
-	Adding evStation: Mumbai GridSpace Mumbai3 DC
-	Adding evStation: Mumbai GridSpace Mumbai4 DC
-	GridSpace now has 12 evStations.
-	Adding evUtility: Enron owned by 0xc23311915cd1188b02f5f5dc6ccbdafbf3b852f0...
-	Adding evStation: Bangkok Enron Bangkok1 Level2
-	Adding evStation: Bangkok Enron Bangkok2 Level2
-	Adding evStation: Bangkok Enron Bangkok3 DC
-	Adding evStation: Bangkok Enron Bangkok4 DC
-	Adding evStation: Hong Kong Enron Hong Kong1 Level2
-	Adding evStation: Hong Kong Enron Hong Kong2 Level2
-	Adding evStation: Hong Kong Enron Hong Kong3 DC
-	Adding evStation: Hong Kong Enron Hong Kong4 Level2
-	Adding evStation: Mumbai Enron Mumbai1 Level2
-	Adding evStation: Mumbai Enron Mumbai2 Level2
-	Adding evStation: Mumbai Enron Mumbai3 DC
-	Adding evStation: Mumbai Enron Mumbai4 DC
-	Enron now has 12 evStations.

### (eval-truffle5): Project directory$ npm run start

-The web application 'Electric Vehicle Charging' will start on port 3000


