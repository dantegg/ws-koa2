/**
 * Created by dantegg on 2017/2/7.
 */
const fs = require('fs')
const url = require('url');
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
const Cookies = require('cookies');

//websocket
const ws = require('ws')
const WebSocketServer = ws.Server

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
    //ctx.cookies.set('name', 'dantegg', {httpOnly:true});
    const start = new Date()
    await next()
    const ms = new Date() -start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})


// app.use(async(ctx,next)=>{
//     console.log('cookie',ctx.cookies.get('name'))
//     await next()
// })

app.use(bodyparser())
app.use(json())
app.use(mount('/static',require('koa-static')(__dirname+'/public')))

app.use(views(__dirname+'/views',{map: {html: 'ejs'}}))
app.use(convert(session(SESSION_CONFIG,app)))
app.use(router.routes(), router.allowedMethods())



let server = app.listen(3000,function () {
    console.log('app started,http://localhost:3000,ctrl-c to terminate')
})


function createWebSocketServer(server,onConnect,onMessage,onError) {
    let wss = new WebSocketServer({
        server: server
    });

    wss.broadcast = function broadcast(data) {
        console.log('data',data)
        wss.clients.forEach(function each(client) {
            client.send(data);
        });
    };

    wss.on('connection', function (ws) {
        let cookies = new Cookies(ws.upgradeReq)
        //console.log('cookie',cookies)
        console.log('cookie is',cookies.get('nickname'))
        let location = url.parse(ws.upgradeReq.url, true);
        console.log('[WebSocketServer] connection: ' + location.href);
        ws.on('message', onMessage);
        ws.on('close', onClose);
        ws.on('error', onError);
        if (location.pathname !== '/ws/chat') {
            // close ws:
            console.log('invalid url')
            ws.close(4000, 'Invalid URL');
        }
        // check user:
        let nickname = cookies.get('nickname')
        let user = Buffer.from(nickname,'base64').toString()
        if (!user) {
            console.log('invalid user')
            ws.close(4001, 'Invalid user');
        }
        ws.user = user
        ws.wss = wss;
        onConnect.apply(ws);
    });
    console.log('WebSocketServer was attached.');
    return wss;
}

var messageIndex=0

function createMessage(type, user, data) {
    messageIndex ++;
    return JSON.stringify({
        id: messageIndex,
        type: type,
        user: user,
        data: data
    });
}

function onConnect() {
    let user = this.user;
    console.log('user',user)
    let msg = createMessage('join', user, `${user} joined.`);

    this.wss.broadcast(msg);
    // build user list:
    //console.log('users',this.wss.clients)
    let users = []
    this.wss.clients.forEach(function (client) {
        users.push(client.user)
    });
    this.send(createMessage('list', user, users));
}

function onMessage(message) {
    console.log(message);
    if (message && message.trim()) {
        let msg = createMessage('chat', this.user, message.trim());
        this.wss.broadcast(msg);
    }
}

function onClose() {
    let user = this.user;
    let msg = createMessage('left', user, `${user} is left.`);
    this.wss.broadcast(msg);
}

app.wss = createWebSocketServer(server,onConnect,onMessage,onClose)

module.exports = app