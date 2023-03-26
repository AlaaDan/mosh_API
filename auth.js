function auth(req,res, next){
    console.log("Authinticating ....")
    next()
}

module.exports = auth