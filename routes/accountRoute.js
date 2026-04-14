const express = require("express")
const router =  new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.post("/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount))

router.get(
  "/",
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(accountController.buildAccountManagement)
)

router.get(
  "/logout",
  utilities.handleErrors(accountController.logoutAccount)
)

router.get("/update/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdate))

router.post(
  "/update/",
  utilities.checkLogin,
  regValidate.updateRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)  

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
router.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})


module.exports = router;