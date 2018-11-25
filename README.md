# Private Blockchain Notary Service

> Extended https://github.com/KushalGH/hapijs_webapi_blockchain Project [Copied the code of this repo to start working on **Private Blockchain Notary Service** project]

- In this project, you will build a Star Registry Service that allows users to claim ownership of their favorite star in the night sky.

# More about the Project

#### Create a Blockchain dataset that allow you to store a Star (You should have this done in Projects 2 and 3)
- The application will persist the data (using LevelDB).
- The application will allow users to identify the Star data with the owner.

#### Create a Mempool component
- The mempool component will store temporal validation requests for 5 minutes (300 seconds).
- The mempool component will store temporal valid requests for 30 minutes (1800 seconds).
- The mempool component will manage the validation time window.

#### Create a REST API that allows users to interact with the application.
- The API will allow users to submit a validation request.
- The API will allow users to validate the request.
- The API will be able to encode and decode the star data.
- The API will allow be able to submit the Star data.
- The API will allow lookup of Stars by hash, wallet address, and height.


# Technologies

- NodeJS: v.8.11.3
- Level DB: 4.0.0
- Crypto-js: 3.1.9
- Hapi: 17.5.3
- ES6 new features


#### INSTALLATIONS

- Most of the required dependencies are already downloaded.
- We need to download the remaining dependencies:
    - **hex2ascii:** npm install hex2ascii
    - **bitcoinjs-message** npm i bitcoinjs-message
    - **bitcoinjs-lib** npm i bitcoinjs-lib
 
# Private Blockchain Notary Service Use Cases

### 1. Blockchain ID validation routine

#### i) Web API post endpoint validates request with JSON response 

Criteria | Web API post endpoint validates request with JSON response. 
------------ | -------------
**Meets Specifications** | - Response should contain message details, request timestamp, and time remaining for validation window. <br /> - User obtains a response in JSON format with a message to sign. <br /> - Message format = [walletAddress]:[timeStamp]:starRegistry <br /> - The request must be configured with a limited validation window of five minutes. <br /> - When re-submitting within validation window, validation window should reduce until it expires. 
**Method** | POST
**Endpoint** | ```http://localhost:8000/requestValidation```
**Parameters** | ```address: Electrum wallet address``` 
**Request** | ```img```
**Response** | ```{ "address": "n2icjrQvgRoEzqMZwLV1teMtz3SQz6L7yx",     "message": "n2icjrQvgRoEzqMZwLV1teMtz3SQz6L7yx:1543166640955:starRegistry",     "requestTimeStamp": 1543166640955, "validationWindow": 300}```

![picture](images/001_requestValidation.png)
![picture](images/002_electrum_test_wallet.png)

#### ii) Web API post endpoint validates message signature with JSON response. 

Criteria | Web API post endpoint validates message signature with JSON response
------------ | -------------
**Meets Specifications** | -Web API post endpoint validates message signature with JSON response. <br /> -Upon validation, the user is granted access to register a single star.
**Method** | POST
**Endpoint** | ```http://localhost:8000/message-signature/validate```
**Parameters** | ```address: Electrum wallet address, which we have used above  signature: Get the Signature using Electrum walet``` 
**Request** | ```img```
**Response** | ```{ "registerStar": true, "status": { "address": "n2icjrQvgRoEzqMZwLV1teMtz3SQz6L7yx", "message":  "n2icjrQvgRoEzqMZwLV1teMtz3SQz6L7yx:1543171862469:starRegistry", "requestTimeStamp": 1543171862469, "validationWindow": 200, "messageSignature": "valid" } }```


![picture](images/003_message_sign.png)

![picture](images/004_electrum_testnet.png)

### 2. Star registration Endpoint

#### i) Web API Post Endpoint with JSON response.
Criteria | Web API post endpoint validates message signature with JSON response
------------ | -------------
**Meets Specifications** | - Star object and properties are stored within the body of the block. <br /> - Star properties include the coordinates with encoded story. <br /> - Star story supports ASCII text, limited to 250 words (500 bytes), and hex encoded.
**Method** | POST
**Endpoint** | ```http://localhost:8000/block```
**Parameters** | ```{ "address": "n2icjrQvgRoEzqMZwLV1teMtz3SQz6L7yx", "star": { "dec":"-26° 29' 24.9", "ra":"16h 29m 1.0s", "story":"Found star using https://www.google.com/sky/" } }``` 
**Request** | ```img```
**Response** | ```{ "hash": "de42565618c02087e730f3bd3e2ddebd302171cdee718eaa355b606f2a89da69", "height": 1, "body": { "address": "n2icjrQvgRoEzqMZwLV1teMtz3SQz6L7yx", "star": {            "dec": "-26° 29' 24.9", "ra": "16h 29m 1.0s", "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f","storyDecoded": "Found star using https://www.google.com/sky/" } }, "time": "1543171993", "previousBlockHash": "dd1898dea66bf19bf1c87b9f14539dadc3562c224a8ec8308329be386f9f0bd5" }```


![picture](images/004_electrum_testnet.png)

![picture](images/005_star_creation.png)

### 3. Star Lookup

#### i) Get star block by hash with JSON response.
Criteria | Get star block by hash with JSON response
------------ | -------------
**Meets Specifications** | - Response includes entire star block contents along with the addition of star story decoded to ascii.
**Method** | GET
**Endpoint** | ```http://localhost:8000/stars/hash:de42565618c02087e730f3bd3e2ddebd302171cdee718eaa355b606f2a89da69```
**Parameters** | ```hash: created in last steps``` 
**Request** | ```img```
**Response** | ```{ "hash": "de42565618c02087e730f3bd3e2ddebd302171cdee718eaa355b606f2a89da69", "height": 1, "body": { "address": "n2icjrQvgRoEzqMZwLV1teMtz3SQz6L7yx", "star": {            "dec": "-26° 29' 24.9", "ra": "16h 29m 1.0s", "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f","storyDecoded": "Found star using https://www.google.com/sky/" } }, "time": "1543171993", "previousBlockHash": "dd1898dea66bf19bf1c87b9f14539dadc3562c224a8ec8308329be386f9f0bd5" }```

![picture](images/006_hash.png)

#### ii) Get star block by wallet address (blockchain identity) with JSON response.
Criteria | Get star block by wallet address (blockchain identity) with JSON response.
------------ | -------------
**Meets Specifications** | - Response includes entire star block contents along with the addition of star story decoded to ascii. - Multiple stars might be registered to a single blockchain identity. 
**Method** | GET
**Endpoint** | ```http://localhost:8000/stars/address:n2icjrQvgRoEzqMZwLV1teMtz3SQz6L7yx```
**Parameters** | ```address: created in last steps``` 
**Request** | ```img```
**Response** | ```{ "hash": "de42565618c02087e730f3bd3e2ddebd302171cdee718eaa355b606f2a89da69", "height": 1, "body": { "address": "n2icjrQvgRoEzqMZwLV1teMtz3SQz6L7yx", "star": {            "dec": "-26° 29' 24.9", "ra": "16h 29m 1.0s", "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f","storyDecoded": "Found star using https://www.google.com/sky/" } }, "time": "1543171993", "previousBlockHash": "dd1898dea66bf19bf1c87b9f14539dadc3562c224a8ec8308329be386f9f0bd5" }```

![picture](images/007_address.png)

#### iii) Get star block by star block height with JSON response.
Criteria | Get star block by star block height with JSON response.
------------ | -------------
**Meets Specifications** | - Response includes entire star block contents along with the addition of star story decoded to ascii.
**Method** | GET
**Endpoint** | ```http://localhost:8000/block/1```
**Parameters** | ```blockheight: created in last steps``` 
**Request** | ```img```
**Response** | ```{ "hash": "de42565618c02087e730f3bd3e2ddebd302171cdee718eaa355b606f2a89da69", "height": 1, "body": { "address": "n2icjrQvgRoEzqMZwLV1teMtz3SQz6L7yx", "star": {            "dec": "-26° 29' 24.9", "ra": "16h 29m 1.0s", "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f","storyDecoded": "Found star using https://www.google.com/sky/" } }, "time": "1543171993", "previousBlockHash": "dd1898dea66bf19bf1c87b9f14539dadc3562c224a8ec8308329be386f9f0bd5" }```


![picture](images/007_address.png)

> **HAPPY CODING!!!** 

> **If you liked my work, please press star and connect with me at:** 

> **GITHub: https://github.com/KushalGH** 

> **LinkedIn: https://linkedin.com/in/sethkushal/**

> **Twitter: https://twitter.com/KushalSeth**




