const utilities = require('../utilities');
const accountModel = require('../models/account-model');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
require('dotenv').config();

/*********************
 * Delivery Login view
 ********************/
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    });
}

/*********************
 * Delivery Account Management view
 ********************/
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav()

  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}



/*********************
 * Delivery Register view
 ********************/
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null
    })
}



/*********************
 * Process Registration
 ********************/
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    const hashedPassword = await bcrypt.hash(account_password, 10)


    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash("notice", `Congratulations, you\'re registered ${account_firstname}. Please log in.`)
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,

    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

// Logout
/* ***************************
 *  Process Logout
 * ************************** */
async function logoutAccount(req, res, next) {
  try {
    // Clear JWT cookie first
    res.clearCookie("jwt")

    // Flash message BEFORE session is destroyed
    req.flash("notice", "You have been logged out.")

    // Now safely destroy session (if you really need it)
    req.session.destroy(() => {
      return res.redirect("/account/login")
    })

  } catch (error) {
    next(error)
  }
}


/* ***************************
 *  Build Account Update View
 * ************************** */
async function buildUpdate(req, res) {
  let nav = await utilities.getNav()

  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    accountData: res.locals.accountData
  })
}


/* ***************************
 *  Process Account Update
 * ************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )

  if (updateResult) {
    req.flash("notice", "Account updated successfully.")
    return res.redirect("/account/")
  } else {
    req.flash("notice", "Update failed.")
    return res.redirect("/account/update")
  }
}

/* ******************************
 *  Update Password
 * ************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body

  const hashedPassword = await bcrypt.hash(account_password, 10)

  const result = await accountModel.updatePassword(account_id, hashedPassword)

  if (result) {
    req.flash("notice", "Password updated successfully.")
    return res.redirect("/account/")
  } else {
    req.flash("notice", "Password update failed.")
    return res.redirect("/account/update")
  }
}


  
module.exports = {buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, logoutAccount, updateAccount, updatePassword, buildUpdate};