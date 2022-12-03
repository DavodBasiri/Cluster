const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
    /*
    Pancake Swap Pairs Response
    https://api.pancakeswap.info/api/v2/pairs
    */
    base_name: { type: String, default: 'a' },
    base_symbol: { type: String, default: 'a' },
    base_address: { type: String, require: true },
    quote_name: { type: String, default: 'a' },
    quote_symbol: { type: String, default: 'a' },
    quote_address: { type: String, require: true },
    pair_address: { type: String, require: true, unique: true },
    price: { type: String, default: 'a' },
    base_volume: { type: String, default: 'a' },
    quote_volume: { type: String, default: 'a' },
    liquidity: { type: String, default: 'a' },
    liquidity_BNB: { type: String, default: 'a' },
    /*
    Our Needs
    */
    pair_name: { type: String, default: 'a' },
    pair_decimals: { type: Number, default: 0 },
    pair_totalSupply: { type: String, default: 'a' },
    pair_poolCreated: { type: String },
    pair_holdercount: { type: Number, default: 0 },
    pair_networkCategory: { type: mongoose.Types.ObjectId, default: '63146889a71308027bdec5b1' },
    pair_blockNumber: { type: Number, require: true },
    pair_transactionHash: { type: String, require: true },
    isCheck: { type: Boolean, default: false },
    isSend: { type: Boolean, default: false },
    isValidate: { type: Boolean, default: false },
    isDone: { type: Boolean, default: false },
    /**
    My Suggestion 
     */
    base_decimals: { type: String, default: 'a' },
    base_totalSupply: { type: String, default: 'a' },
    quote_decimals: { type: String, default: 'a' },
    quote_totalSupply: { type: String, default: 'a' }
}, {
    timestamps: false
});
const fxDB = mongoose.createConnection('mongodb://localhost:27017/fxDB')
const DB_Pancake_= mongoose.createConnection("mongodb://localhost:27017/DB_Pancake");
module.exports = {
    Pairs2Model: fxDB.model("pairs2", Schema),
    PairsModel : DB_Pancake_.model('pairs2',Schema)
}