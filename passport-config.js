const localStrategy = require('passport-local').Strategy,
      bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById){
    const authentitaceUser = async (email, password, done) =>{
        const user = getUserByEmail(email);
        if (user == null){
            return done(null, false, {message: 'no user with that email'});
        };

        try{
            if(await bcrypt.compare(password, user.password)){
                return done(null, user)
            }
            else{
                return done(null, false, {message: 'wrong password'})
            }
        } 
        catch(e){
            return done(e)
        }
    };

    passport.use(new localStrategy({
        usernameField: 'email'
    }, authentitaceUser));
    
    passport.serializeUser((user, done) => {
        return done(null, user.id)
    });
    
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    });
};

module.exports = initialize