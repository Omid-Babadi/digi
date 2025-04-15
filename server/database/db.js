const mongoose = require('mongoose');



const connection = async ()=>{
    await mongoose.connect(process.env.MONGO_URL).then(()=> console.log('mongo is connected')).catch(e => console.log(e));
};

module.exports = connection;