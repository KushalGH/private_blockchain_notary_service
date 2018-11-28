const level = require('level');
const starDB = './stardata';
const db = level(starDB);
const bitcoinMessage = require('bitcoinjs-message');
const verificationTimeWall = 5*60*1000; //Five Minutes

class Validation{
	constructor (req){
		this.req = req;
	}

	addressIsValid(){
		return new Promise((resolve, reject) => {
			console.log("log addressIsValid ", this.req);
			db.get(this.req.address).then(function(data, data2) {
				    console.log("data ", data, " data2: ", data2)
					return resolve(true) 
			}).catch(function(error, error2) {
					console.log("error ", error, " error2: ", error2)
					return resolve(false); 
			})
		});

	}

	deleteAddress(address) {
		return new Promise((resolve, reject) => {
			console.log("log addressIsValid ", this.req);
			db.del(address).then(function(data, data2) {
				    console.log("data ", data, " data2: ", data2)
					return resolve(true) 
			}).catch(function(error, error2) {
					console.log("error ", error, " error2: ", error2)
					return resolve(true); 
			})
		});		
	}

	async validateMsgSignature(address, signature){
		return new Promise((resolve, reject) => {
			db.get(address, (error, value) => {
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
					const expired = value.requestTimeStamp < (Date.now() - verificationTimeWall)
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
		return new Promise((resolve, reject) => {
			db.get(address, (error, value) => {
				if (value === undefined) {
					return reject(new Error("Not Found!"))
				} else if (error) {
					return reject(error)
				}
				value = JSON.parse(value)
				const expired = value.requestTimeStamp < (Date.now() - verificationTimeWall)
				if (expired) {
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
