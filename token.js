const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
    /*
    Pancake Swap tokens Response
    https://api.pancakeswap.info/api/v2/tokens
    */
    token_name: { type: String },
    token_symbol: { type: String,require: true},
    token_address: { type: String, require: true ,unique: true},
    token_price: { type: String, default: 'a' },
    token_volume: { type: String, default: 'a' },
    token_liquidity: { type: String, default: 'a' },
    token_liquidity_BNB: { type: String, default: 'a' },
    /*
    Our Needs
    */
    token_decimals: { type: Number, default: 0 },
    token_totalSupply: { type: String, default: 'a' },
    token_holdercount: { type: Number, default: 0 },
    token_networkCategory: { type: [mongoose.Types.ObjectId], default: '63146889a71308027bdec5b1' },
    token_blockNumber: { type: Number,  },
    isCheck: { type: Boolean, default: false },
    /**
    My Suggestion 
     */
}, {
    timestamps: false
});
const DB_Pancake= mongoose.createConnection("mongodb://localhost:27017/DB_Pancake");
module.exports = {
    TokensModel: DB_Pancake.model("tokens", Schema)
}