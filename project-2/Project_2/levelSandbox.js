const level = require('level');
const starDB = './stardata';
const db = level(starDB);
const bitcoinMessage = require('bitcoinjs-message');
const verificationTimeWall = 5*60*1000; //Five Minutes

class Validation{
	constructor (req){
		this.req = req;
	}

	addressIsValid() {
		return new Promise((resolve, reject) => {
			console.log("log addressIsValid ", this.req);
			//try{ 
				db.get(this.req.address, function(err, value) {
					console.log("log error ", err, " value: ", value);
      				if (err) {
        				var obj = {
          					error: "Error. Block doesnot exist."
       					}
       					return resolve(false); 
      				}      
      				else {
        				console.log("getLevelDBData success: ", JSON.stringify(value));
        				//return resolve(JSON.stringify(value))
        				return resolve(true) 
      				};			
				})
				/*.catch(error) {
				console.log("$$ catch: ", "custom key not found");
       			return resolve(false); 						
				}*/
			/*}
			catch(error) {
				console.log("getLevelDBData catch: ", "key not found");
       			return resolve(false); 				
			}*/
		});

	}

	deleteAddress(address){
		db.del(address)
	}

	async validateMsgSignature(address, signature){
		return new Promise((resolve, reject) => {
			db.get(address, (error, value) => {
				console.log("**********value: ", value);
				if (value === undefined) {
					return reject(new Error("Not Found"))
				} else if (error) {
					return reject(error)
				}
				value = JSON.parse(value)
				if (value.messageSignature === 'valid') {
					return resolve({
						registerStar: true,
						status: value
					})
				} else {
					console.log("**********requestTimeStamp: ", value.requestTimeStamp);
					console.log("**********verificationTimeWall: ", verificationTimeWall);
					
					const expired = value.requestTimeStamp < (Date.now() - verificationTimeWall)
					console.log("**********expired: ", expired);
					let isValid = false
					if (expired) {
						value.validationWindow = 0
						value.messageSignature = 'Validation window is expired!'
					} else {
						value.validationWindow = Math.round((value.requestTimeStamp - (Date.now() - verificationTimeWall))/1000)
						try{
							isValid = bitcoinMessage.verify(value.message, address, signature)
						} catch(error){
							isValid = false
						}
						if (isValid) {
							value.messageSignature = 'valid'
						} else {
							value.messageSignature = 'invalid'
						}
					}
					db.put(address, JSON.stringify(value))
					return resolve({
						registerStar: !expired && isValid,
						status: value
					})
				}
			})
		})
	}

	saveRequestValidation(address, validationWindowTime){

		const timeStamp = Date.now()
		const msg = `${address}:${timeStamp}:starRegistry`
		const data = {
			address: address,
			message: msg,
			requestTimeStamp: timeStamp,
			validationWindow: validationWindowTime
		}
		db.put(data.address, JSON.stringify(data))
		return data
	}

	async getInQueueRequests(address, validationWindowTime){
		console.log("levelsandbox value.requestTimeStamp");
		
		return new Promise((resolve, reject) => {
			db.get(address, (error, value) => {
				value = JSON.parse(value)
				console.log("****expired ", value.requestTimeStamp
								 , " w: ", validationWindowTime
								 , " now: ", Date.now());
				const expired = value.requestTimeStamp < (Date.now() - verificationTimeWall)
				if (value === undefined) {
					return reject(new Error("Not Found!"))
				} else if (error) {
					return reject(error)
				}
				console.log("****levelsandbox ", value , " w: ", validationWindowTime, " expired: ", expired);

				if (expired) {
					console.log("****call from  getInQueueRequests", value , " w: ", validationWindowTime);
					resolve(this.saveRequestValidation(address))
				} else {
					const data = {
						address: address,
						message: value.message,
						requestTimeStamp: value.requestTimeStamp,
						validationWindow: validationWindowTime
					}
					resolve(data)
				}
			})
		})
	}
}

module.exports = Validation
