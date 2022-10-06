const express               = require('express');
const app                   = express();
const bodyParser            = require('body-parser');
const cors                  = require('cors');
const validUrl              = require('valid-url');
const randomstring          = require("randomstring");
const mongoose              = require('mongoose');
let dotenv                  =require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URL,{useNewUrlParser: true,useUnifiedTopology: true},(err,result)=>
{
  if(err)
  {
    console.err(err);
  }
  else if(result)
  {
    console.log("DB connected");
  }
});

let urlSchema = new mongoose.Schema({
  original_url : String,
  short_url    : String
});

let urlModel = new mongoose.model('urlSchema',urlSchema,'urls');


app.use(cors({
    optionsSuccessStatus: 200
})); // some legacy browsers choke on 204
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/",(req,res)=>
{
  res.sendFile(__dirname + "/dist/index.html");
});

app.get("/api/shorturl/:short_url",(req,res)=>
{
  urlModel.findOne({short_url:req.params.short_url},(err,result)=>
  {
    if(err)
    {
      console.err(err);
    }
    else if(result)
    {
      res.redirect(result.original_url);
    }
  });
});


app.post("/api/shorturl/",(req,res)=>
{
  let url       = req.body["link"];
  if(validUrl.isUri(url)){
    let shorturl = randomstring.generate(Math.round(url.length/5));
    let respondJson = {original_url:url,short_url:shorturl};
    let jsonAddDb = new urlModel(respondJson);
    jsonAddDb.save(function(err,result){
      if (err){
          console.log(err);
      }
      else{
          console.log(result)
      }
  })
    res.json(respondJson);
  }
  else {
      res.json({ error: 'invalid url' });
  }
});

app.listen(process.env.PORT || 3000);
