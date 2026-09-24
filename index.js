import express from 'express';
const app = express();

app.get('/', (req, res)=>{
    res.json({"message":"I learned API in nodejs"});
});

app.get('/weather/:city', (req, res)=>{
    //sonigara tirth test........
    // res.send(req.params.city);
    if(req.params.city=="rajkot")
    {
        res.json({"temp":"32* C"});
    }
    if(req.params.city=="ahmedabad")
    {
        res.json({"temp":"36* C"});
    }
    if(req.params.city=="surat")
    {
        res.json({"temp":"30* C"});
    }
    if(req.params.city=="baroda")
    {
        res.json({"temp":"35* C"});
    }
    if(req.params.city=="junagadh")
    {
        res.json({"temp":"51* C"});
    }

    res.json({"temp":"NA"});
});

// app.get('/weather/ahmedabad', (req, res)=>{
//     res.json({"temp":"36* C"});
// });

app.listen(3000, ()=>{
    console.log("app is running");
});