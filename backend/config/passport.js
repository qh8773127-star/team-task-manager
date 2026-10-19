const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const pool = require('./db');

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

      if (user.rows.length === 0) {
        return done(null, false, { message: 'Incorrect email.' });
      }

      const isMatch = await bcrypt.compare(password, user.rows[0].password);

      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user.rows[0]);
    } catch (err) {
      return done(err);
    }
  })
);

// Session mein sirf user ki ID save hogi
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Session se ID nikal kar user ka data fetch hoga
passport.deserializeUser(async (id, done) => {
  try {
    const user = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [id]);
    done(null, user.rows[0]);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;