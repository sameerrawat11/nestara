const User = require("../models/user.js");

module.exports.renderSignupForm =  (req, res) => {
  res.render("users/signup.ejs");
}

module.exports.signup = async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to Nestara!");
        return res.redirect("/listings");
      });
      
      
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  }

module.exports.renderAccountAccessForm = (req, res) => {
  res.render("users/accessacc.ejs");
}

module.exports.accountAccess = async(req, res, next) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        req.flash("error", "Invalid username");
        return res.redirect("/accessacc");
    }

    req.login(user, (err) => {
        if (err) return next(err);

        req.flash("success", "Welcome back to Nestara !");
        let redirectUrl = res.locals.redirectUrl || "listings";
        res.redirect(redirectUrl);
    });
}

module.exports.logout = (req, res,next) => {
  req.logout((err) => {
    if(err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  })
}
