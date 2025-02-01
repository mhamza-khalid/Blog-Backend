const passport = require('passport'); // Require Passport
const { PrismaClient } = require('@prisma/client')
const prisma           = new PrismaClient()

//so this JwtStrategy extracts the jwt from the auth header sent by client
//it then decodes it with the secret key and extracts the payload from
//the jwt. if it fails to decode or is invalid token
var JwtStrategy = require('passport-jwt').Strategy; // using jwt strategy here
var ExtractJwt = require('passport-jwt').ExtractJwt; //contains methods on how jwt will be 
                                                     // extracted from the broswer cookie 
                                                     // or http req headers
var opts = {} //we have to include from where we will extract the jwt when client sends it
              //and also the secret key used to decode the jwt in this object

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';


//this strategy checks if client sent token is valid
passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { user_id: jwt_payload.id },
      });

      if (user) {
        return done(null, user); // Success
      } else {
        return done(null, false); // User not found
      }
    } catch (err) {
      return done(err); // Error occurred
    }
  })
);

async function isAuthenticated(req, res, next){
    passport.authenticate('jwt', { session: false }, function(err, user, info, status) {
        //once signed in we can use the user that is attached to req.user in next middlewares
        req.user = user
        if (err) { return res.status(500).send("Internal server error") }
        if (!user) { return res.status(401).json('Please sign in') }

        res.status(200).json({id: user.user_id, name: user.username}) //send user to client
        next()
      })(req, res, next);
}

module.exports = isAuthenticated