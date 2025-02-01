const passport = require('passport'); // Require Passport
const LocalStrategy = require('passport-local').Strategy
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

//local strategy that looks up db if email and password are correct
passport.use(new LocalStrategy(
  {
    usernameField: 'email', // Maps 'email' from req.body
    passwordField: 'password' // Maps 'password' from req.body
  },
  async (username, password, done) => {
    try {
      console.log(username)
      console.log(password)
      const user = await prisma.user.findUnique({
        where: { email: username }, 
      });
      if (!user) { return done(null, false); }
      if (!(user.password == password)) { return done(null, false)}

      return done(null, user);
      
    }
    catch(err){
      done(err)
    }
    
  }
));



function signIn (req, res, next) {
    //uses local strategy to check if user entered credentials are correct
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      if (!user) {
        // Authentication failed
        console.log('Failed authentication')
        return res.status(401).json({ message: 'Incorrect email or password' });
      }
  
      // User authenticated, sign a JWT token
      // on the front end we will store the JWT in the local storage
      // exposing nothing to the client except a strongly encrypted
      // JWT!

      console.log(user)
      const token = jwt.sign(
        { id: user.user_id, username: user.username }, // Payload
        'secret',                                      // Secret key
        { expiresIn: '4h' }                            // Token expiration in 4 hours
      );
  
      // Send the token to the client
      res.status(200).json({ token }); 
    })(req, res, next);
};

module.exports = {
    signIn
}