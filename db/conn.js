const mongoose= require('mongoose')
const dotenv = require('dotenv')
dotenv.config({path: './config.env' })
mongoose.set('strictQuery', true);
const db= process.env.DATABASE;
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connection Successful to DB");
}).catch((err) => console.log("Connecton Error"));
