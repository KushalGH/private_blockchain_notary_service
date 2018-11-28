
const myPrivateBlockchain = require('./simpleChain');
const blockchain = new myPrivateBlockchain.Blockchain();
const Block = require('./Block');
const StarValidation = require('./levelSandbox')
const fiveMins = 5*60
const maxStoryLength = 500
var requests = []
var startTime
var validationWindow = fiveMins

'use strict';
const Hapi=require('hapi');

// Create a server with a host and port
const server=Hapi.server({
    host:'localhost',
    port:8000
});

// Add the route
server.route([
    { method: 'GET',
    path:'/',
    handler: function(request,h){
        return "Welcome to the \"RESTful Web API with Hapi.js Framework\" project.";
    }},
    { method:'GET',
    path:'/block/{blockNumber}',
    handler:async function(request,h) {
        let blockHeight = request.params.blockNumber;
        if (blockHeight<0) {
            return "ERROR!\n" + "Invalid Block Height!";
        } else {
            return blockchain.getBlockByHeight(blockHeight);
        }
    }},
    { method: 'POST',
    path: '/requestValidation',
    handler:async function(request,h) {
        console.log("payload add ", request.payload);
        if (request.payload === null){
            return "ERROR!\n" + "Please add your wallet address to the POST request!";
        } else {
            const starValidation = new StarValidation(request)
            const address = request.payload.address
            if (validationWindow <= 1) {
                requests = []
            }
            if (requests.length>0) {
                const endTime = new Date()
                validationWindow = fiveMins - Math.round((endTime - startTime)/1000)
            } else {
                startTime = new Date()
                validationWindow = fiveMins
                requests.push(address)
            }
            try{
                console.log("getInQueueRequests ", request.payload.address);
                data = await starValidation.getInQueueRequests(address, validationWindow)
                console.log("data getInQueueRequests ", data);
            } catch(error) {
                console.log("saveRequestValidation ", request.payload.address);
                data = await starValidation.saveRequestValidation(address, validationWindow)
                console.log("data saveRequestValidation ", data);
            }
            const response = h.response(data)
            response.code = (data.code)
            response.header('Content-Type', 'application/json; charset=utf-8')
            return response
        }
    }},
    { method: 'POST',
    path: '/message-signature/validate',
    handler:async function(request,h){
        if (request.payload === null){
            return "ERROR!\n" + "Please add your wallet address and message signature to the POST request!";
        } else {
            const starValidation = new StarValidation(request)
            try{
                const {address, signature} = request.payload
                const replyMsg = await starValidation.validateMsgSignature(address, signature)
                if (replyMsg.registerStar) {
                    const response = h.response(replyMsg)
                    response.code = (replyMsg.code)
                    response.header('Content-Type', 'application/json; charset=utf-8')
                    return response
                } else {
                    return h.response(replyMsg).code(401)
                }
            } catch(error){
                h.response({
                    status: 404, 
                    message: error.message
                }).code(404)
            }
        }
    }},
    { method: 'POST',
    path: '/block',
    handler:async function(request,h){
        if (request.payload === null){
            return "ERROR!\n" + "Please add your wallet address and star information to the POST request!";
        } else {
            const starValidation = new StarValidation(request.payload)
            console.log("log starValidation: ", starValidation);
            const body = {address, star} = request.payload
            const story = star.story
            const dec = star.dec
            const ra = star.ra

            console.log("log Buffer.from(story): ", Buffer.from(story));
            if (new Buffer.from(story).length > maxStoryLength) {
                console.log("Your story is too long!")
                throw new Error("Your story is too long!")
            }

            if (typeof dec !== 'string' || typeof ra !== 'string' || typeof story !== 'string' || 
                !dec.length || !ra.length || !story.length) {
                    console.log("Please enter correct information for 'dec', 'ra' and 'story' properties!")
                    throw new Error("Please enter correct information for 'dec', 'ra' and 'story' properties!")
            }   

            try{
                console.log("log checking validity");
                const isValid = await starValidation.addressIsValid();
                console.log("log isValid", isValid);
                if (!isValid) {
                    throw new Error("The signature isn't valid!")
                }
            } catch(error){
                h.response({
                    status: 401, 
                    message: error.message
                }).code(401)
                return
            }
            body.star = {
                dec: star.dec,
                ra: star.ra,
                story: new Buffer.from(story).toString('hex'),
                mag: star.mag,
                con: star.con
            }
            console.log("adding block: ", body);
            await blockchain.addBlock(new Block(body))
            const blockHeight = await blockchain.getBlockHeight()
            const theNewBlock = await blockchain.getBlock(blockHeight)
            const response = h.response(theNewBlock).code(201)
            await starValidation.deleteAddress(address)
            response.header('Content-Type', 'application/json; charset=utf-8');
            return response;
        }
    }},
    { method: 'GET',
    path: '/stars/address:{address}',
    handler:async function(request,h){
        console.log("log ", request);
        try{
            const blockAddress = encodeURIComponent(request.params.address);
             console.log("blockAddress ", blockAddress);
            const block = await blockchain.getBlocksByAddress(blockAddress)
            const response = h.response(block)
            response.header('Content-Type', 'application/json; charset=utf-8');
            return response;
        } catch(error){
            h.response({
            status: 404, 
            message: "Block Not Found"
            }).code(404) 
        }  
    }},
    { method: 'GET',
    path: '/stars/hash:{hash}',
    handler:async function(request,h){
        try{
            const hashString = encodeURIComponent(request.params.hash);
            const block = await blockchain.getBlockByHash(hashString)
            const response = h.response(block)
            response.header('Content-Type', 'application/json; charset=utf-8');
            return response;
        } catch(error){
            h.response({
            status: 404, 
            message: "Block Not Found"
            }).code(404) 
        }  
    }}
]);

// Start the server
async function start() {

    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};

start();
