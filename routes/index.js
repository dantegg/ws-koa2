/**
 * Created by dantegg on 2017/2/7.
 */
const router = require('koa-router')()

setInterval(function () {
    let date = new Date()
    console.log('current time',date)
},5000)

router.get('/',async (ctx)=>{
    await ctx.render('home')
})

exports.router = router