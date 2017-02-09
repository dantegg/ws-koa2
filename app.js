/**
 * Created by dantegg on 2017/2/7.
 */
const fs = require('fs')
const path = require('path')
const Koa = require('koa')
const session = require('koa-session')
const  views = require('koa-views')
const convert = require('koa-convert')
const mount = require('koa-mount')
const json = require('koa-json')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const router = require('./routes').router

//websocket
const ws = require('ws')

const SESSION_CONFIG = {
    key: 'wskoa20170207',
    maxAge:3600000,
    overWrite:true,
    httpOnly:true,
    signed:true
}

const app = new Koa()
app.keys=['blog20170101']
app.env='development'
app.use(logger())



app.on('error',function (err,ctx) {
    console.log('error occured:', err.stack)
})

app.use(async (ctx,next)=>{
    ctx.cookies.set('name', 'dantegg', {httpOnly:true});
    const start = new Date()
    await next()
    const ms = new Date() -start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})


app.use(async(ctx,next)=>{
    console.log('cookie',ctx.cookies.get('name'))
    await next()
})

app.use(bodyparser())
app.use(json())
app.use(mount('/static',require('koa-static')(__dirname+'/public')))

app.use(views(__dirname+'/views',{map: {html: 'ejs'}}))
app.use(convert(session(SESSION_CONFIG,app)))
app.use(router.routes(), router.allowedMethods())



app.listen(3000,function () {
    console.log('app started,http://localhost:3000,ctrl-c to terminate')
})



module.exports = app