/**
 * Created by dantegg on 2017/2/7.
 */
const router = require('koa-router')()

router.get('/',async (ctx)=>{
    await ctx.render('home')
})

exports.router = router