const dotenv=require('dotenv');
//to load environment variable
dotenv.config();

const app=require("./app");
const connectDB=require("./database/db")

//connect database
connectDB();
 
//port 
const PORT=process.env.PORT|| 5000;

app.listen(PORT,()=>{
    console.log(`🚀 the server is running on port:${PORT}`);
});
