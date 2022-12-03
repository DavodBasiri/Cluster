const express = require("express")
const app = express();
const cluster = require('cluster');
const mongoos = require("mongoose");
const { rpc, abiSample, pancakeSwapABI, pancakeSwap_router_abi, pancakeSwap_router_address } = require("./const");
const Web3 = require('web3');
const axios = require('axios');
const { TokensModel } = require("./token");
const { PairsModel } = require("./paris");
let counter = 0;
let base_contract;
let quote_contract;
let pair_contract;
let web3getTokenInfo;
let indexweb = 0;
let base_name;
let base_totalSupply;
let base_decimals;
let base_symbol;
let saveBase = false;
let quote_symbol;
let quote_name;
let quote_decimals;
let quote_totalSupply;
let saveQoute = false;
app.get("/", async (req, res, next) => {
    //connectToMongoos()
    let result = await PairsModel.find({ base_name: 'a' }).limit(100);
    const lenght = result.length;
    console.log(lenght);

    for (let i = 0; i < lenght; i++) {
        counter = 0;
        saveBase = false;
        saveQoute = false;
        console.log('--------------------- ', i, '---------------------', i + 1)
        await saveTokenInfo(result[i].base_address, result[i].quote_address, result[i].pair_address, result[i].pair_blockNumber);
    }
    cluster.worker.kill();
    res.send(`the end requsest on process id [${process.pid}]  `)
})
app.listen(3400, () => {
    //connectToMongoos()
    console.log("server ready on : http://localhost:3400")
})
async function saveTokenInfo(base_address, quote_address, pair_address, pair_blockNumber) {
    try {
        process.env.TZ = 'Europe/Amsterdam'
        console.log('getTokenInfo')
        if (counter == 0) {
            web3getTokenInfo = new Web3(rpc[indexweb]);
            base_contract = new web3getTokenInfo.eth.Contract(abiSample, base_address);
            quote_contract = new web3getTokenInfo.eth.Contract(abiSample, quote_address);
            pair_contract = new web3getTokenInfo.eth.Contract(pancakeSwapABI, quote_address);
            router_contract = new web3getTokenInfo.eth.Contract(pancakeSwap_router_abi, pancakeSwap_router_address);
            saveBase = false;
            saveQoute = false;
            counter = 0;
            quote_name = ' ';
            quote_symbol = ' ';
            quote_decimals = ' ';
            quote_totalSupply = ' ';
            base_name = ' ';
            base_symbol = ' ';
            base_decimals = ' ';
            base_totalSupply = ' ';
            console.log("1564")
            //web=web3getTokenInfo;
        }
        console.log(base_address, quote_address, pair_address, pair_blockNumber)
        counter++;
        let pair_balance = await base_contract.methods.balanceOf(pair_address).call();
        let block_timestamp = await web3getTokenInfo.eth.getBlock(pair_blockNumber)
        block_timestamp = block_timestamp.timestamp
        let pair_poolCreated = new Date(Number(block_timestamp) * 1000)
        let pair_decimals = await pair_contract.methods.decimals().call();
        let pair_totalSupply = await pair_contract.methods.totalSupply().call();
        const response = await axios.get(`https://bscscan.com/token/${pair_address}`)
        const data = response.data.split('addresses')[0]
        const finalData = data.split('"mr-3">\n')
        let pair_holdercount = finalData[finalData.length - 1];

        let token_base = await TokensModel.findOne({ token_address: base_address })
        if (token_base <= 0) {
            base_name = await base_contract.methods.name().call();
            base_totalSupply = await base_contract.methods.totalSupply().call();
            base_decimals = await base_contract.methods.decimals().call();
            base_symbol = await base_contract.methods.symbol().call();
            saveBase = await saveTokenInDataBase(base_name, base_symbol, base_address, base_decimals, base_totalSupply);
        } else {
            base_name = token_base.token_name;
            base_symbol = token_base.token_symbol;
            base_decimals = token_base.token_decimals;
            base_totalSupply = token_base.token_totalSupply
            saveBase = true;
            console.log(base_decimals, ' ToKen base ExiSte ', base_symbol);
        }
        let token_quote = await TokensModel.findOne({ token_address: quote_address });
        if (token_quote <= 0) {
            quote_symbol = await quote_contract.methods.symbol().call();
            quote_name = await quote_contract.methods.name().call();
            quote_decimals = await quote_contract.methods.decimals().call();
            quote_totalSupply = await quote_contract.methods.totalSupply().call();
            saveQoute = await saveTokenInDataBase(quote_name, quote_symbol, quote_address, quote_decimals, quote_totalSupply);
        } else {
            quote_name = token_quote.token_name;
            quote_symbol = token_quote.token_symbol;
            quote_decimals = token_quote.token_decimals;
            quote_totalSupply = token_quote.token_totalSupply;
            saveQoute = true;
            console.log(quote_decimals, ' ToKen quote ExiSte  ', quote_symbol);
        }

        //let amounts = web3getTokenInfo.utils.fromWei((await router_contract.methods.getAmountsOut(1 * 10 ** pair_decimals, [quote_address, base_address]).call()).toString());
        //let price = web3.utils.fromWei(amounts.toString());
        //console.log(amounts)
        /**
         save data to db
        */
        let pair_name = base_symbol + '_' + quote_symbol;
        console.log(saveBase, saveQoute, pair_name)
        let isCheck = true;
        if (saveBase && saveQoute) {
            console.log(saveBase, saveQoute, pair_name)
            console.log('base_symbol  : ', base_symbol, ' base_name : ', base_name, ' base_decimals : ', Number(base_decimals), ' base_totalSupply : ', base_totalSupply,
                '\nquote_symbol : ', quote_symbol, ' quote_name : ', quote_name, ' quote_decimals : ', Number(quote_decimals), ' quote_totalSupply : ', quote_totalSupply
                , '\npair_balance : ', pair_balance, ' pair name  : ', pair_name, ' pair_decimals : ', Number(pair_decimals), ' pair_totalSupply : ', pair_totalSupply,
                '\npair_holdercount : ', pair_holdercount, ' createdAt : ', pair_poolCreated.toISOString(), ' liquidity : ', toFixed(2 * pair_balance),
                '\n', pair_address);
            const Pair = await PairsModel.findOne({ pair_address: pair_address })
            if (Pair) {
                Pair.update({
                    base_name, base_symbol, base_decimals, base_totalSupply, quote_symbol, quote_name, liquidity: toFixed(2 * pair_balance), isCheck
                    , quote_decimals, quote_totalSupply, pair_decimals, pair_totalSupply, pair_name, pair_balance, pair_holdercount, pair_poolCreated: pair_poolCreated.toISOString()
                }, {}, (err, done) => {
                    console.log('update');
                    console.log(done)
                    counter = 0;
                    return true;
                })
            }
        }


        // let resulte = await Pairs2Model.findOneAndUpdate({ pair_address: pair_address }, {
        //     $set: {
        //         base_name: base_name, base_decimals: base_decimals, base_totalSupply: base_totalSupply
        //     }
        // })
        // if (resulte)



    } catch (error) {
        console.log(error.message)
       
        if (error.message == 'Request failed with status code 503')
            console.log('first')
        if (rpc.length - 1 > indexweb) {
            indexweb = indexweb + 1;
            console.log("RPC Changed")
            web3getTokenInfo = new Web3(rpc[indexweb]);
            base_contract = new web3getTokenInfo.eth.Contract(abiSample, base_address);
            quote_contract = new web3getTokenInfo.eth.Contract(abiSample, quote_address);
        }
        else {
            indexweb = 0;
            console.log("RPC Changed")
            web3getTokenInfo = new Web3(rpc[indexweb]);
            base_contract = new web3getTokenInfo.eth.Contract(abiSample, base_address);
            quote_contract = new web3getTokenInfo.eth.Contract(abiSample, quote_address);
        }
    }
}
async function saveTokenInDataBase(token_name, token_symbol, token_address, token_decimals, token_totalSupply) {
    const token = await TokensModel.create({ token_name, token_symbol, token_address, token_decimals, token_totalSupply });
    if (token) {
        console.log(token_decimals, ' NOW TOKEN ADD ', token_symbol)
        return true
    }
    return false
}