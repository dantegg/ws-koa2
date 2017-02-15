/**
 * Created by dantegg on 2017/2/7.
 */
const router = require('koa-router')()


setInterval(function () {
    let date = new Date()
    console.log('current time',date.toLocaleDateString())
},1000*60)

router.get('/',async(ctx)=>{
    const isLogin = !!ctx.session.nickname
    await ctx.redirect(isLogin ? '/home' : '/login')
})

router.get('/home',async (ctx)=>{
    //console.log('home session',ctx.session)
    //console.log('ctx',ctx.cookies.get('nickname'))
    const cookieLogin = ctx.cookies.get('nickname')
    //console.log('cookie  !!!!',!!cookieLogin)
    if(!cookieLogin) {
        ctx.session = null
        ctx.redirect('/login')
    }else{
        await ctx.render('home')
    }

})

router.get('/login',async (ctx)=>{
    await ctx.render('login')
})

router.post('/api/login',async(ctx)=>{
    console.log('body',ctx.request.body.nickname)
    ctx.session.nickname= ctx.request.body.nickname
    let zz = ctx.request.body.nickname
    let nickname = Buffer.from(zz).toString('base64')
    ctx.cookies.set('nickname', nickname, {httpOnly:true});
    ctx.redirect('/home')
})

router.get('/api/logout',async(ctx)=>{
    ctx.session = null
    ctx.redirect('/')
})

exports.router = router