const express = require('express')
const axios = require('axios')
const moment = require('moment')

const app = express()
app.use(express.json()) 
const port = 4004

var cred = require("./cred.js")

app.post('/', (req, res)=>{
    const { body, query } = req

        var reqAPIKey = req.get("api-key")
        if(cred.apiKey == reqAPIKey){
            const { template, phone, headers, values } = body
            axios.post(cred.wame.url, 
            {
                countryCode: "+91",
                phoneNumber: phone,
                type: "Template",
                template: {
                    name: template,
                    languageCode: "en",
                    headerValues: headers || [],
                    bodyValues: values || []
                }
            },
            {
                headers: {
                    'content-type': 'text/json',
                    Authorization: cred.wame.auth
                }
            }).then(r => {
                res.status(200)
                res.send()
            })
            .catch(err => {
                res.status(err.response.status)
                res.send(err.response.data.message)
            })
        }else{
            res.status(401).send("API Key mismatch")
        }
    
})

app.listen(port, () => {
    console.log(`wame app listening at http://localhost:${port}`)
})
