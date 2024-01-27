const express = require('express')
const axios = require('axios')
const moment = require('moment')

const app = express()
app.use(express.json()) 
const port = 4004

var cred = require("./cred.js")

var webhookStore = {}

app.post('/', (req, res)=>{
    const { body, query } = req

    if(query.status=="sent"){
        const { data, type } = req.body
        if(type=="message_api_sent"){
            const id = data.message.id
            if(webhookStore[id]){
                const status = data.message.message_status
                webhookStore[id].res.status(status=="Sent"?200:500).send(status)
                webhookStore.delete(id) 
            }
        }
        res.status(200)
        res.send()
    }else{
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
            const time = moment()
            webhookStore[r.data.id]={ time, res }
        })
        .catch(err => {
            res.status(err.response.status)
            res.send(err.response.data.message)
        })
    }
})

app.listen(port, () => {
    console.log(`wame app listening at http://localhost:${port}`)
})


setInterval(()=>{
    Object.keys(webhookStore).forEach(id=>{
        var resObj = webhookStore[id]
        if(moment().diff(resObj.time, 'minutes')>=2){
            resObj.res.status(408)
            resObj.res.send()
            webhookStore.delete(id)
        }
    })
}, 60*1000)
