const express =require("express")
const path=require("path")
const app=express()
const port = process.env.PORT || 5000


var cors = require('cors')
app.use(cors())
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/public', express.static(path.join(__dirname, 'public')))

app.post("/checkreceipt",(req,res)=>{
    console.log(req.data)
    res.send('in check receipt--->',req.data)

})

//Routes
app.get('/', (req, res) => {
})


  




app.listen(port, () => {
  console.log(`app listening at PORT:${port}`)
})