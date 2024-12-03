const moment = require("moment")
const consolas = console.log
console.log = function (...args) {
  const timestamp = new Date().toISOString()
  consolas.apply(console, [`[${moment(timestamp).format("YY-MMM-DD HH:mm")}]`, ...args])
}

const express = require('express')
const axios = require('axios')

const app = express()
app.use(express.json()) 
const port = 4004

var cred = require("./cred.js")

const TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot(cred.telebot.botToken, {polling: false})

app.post('/', (req, res)=>{
    const { body } = req

        var reqAPIKey = req.get("api-key")
        if(cred.apiKey == reqAPIKey){
            const { template, phone, headers, values, buttons } = body
            axios.post(cred.wame.url, 
            {
                countryCode: "+91",
                phoneNumber: phone,
                type: "Template",
                template: {
                    name: template,
                    languageCode: "en",
                    headerValues: headers || [],
                    bodyValues: values || [],
                    buttonValues: buttons || {} 
                }
            },
            {
                headers: {
                    'content-type': 'text/json',
                    Authorization: cred.wame.auth
                }
            }).then(() => {
                console.log(`${phone} > ${template}: ${headers}/${values}`)
                res.status(200)
                res.send()
            })
            .catch(err => {
                bot.sendMessage(cred.telebot.apiChatID, `[Wame Error] ${err}`)
                console.log(`${err}`)

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
