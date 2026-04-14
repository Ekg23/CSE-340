const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
  
/*  **********************************
*  Inventory Data Validation Rules
* ********************************* */
validate.addInventoryRules = () => {
  return [
    // inv_make is required and must be string
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a make."), // on error this message is sent.

    // inv_model is required and must be string
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a model."), // on error this message is sent.

    // inv_year is required and must be a valid year
    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isInt({ min: 1886, max: new Date().getFullYear() + 1 }) // Cars were invented        in 1886, and we allow up to next year
      .withMessage("Please provide a valid year."),

    // inv_description is required and must be string
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 10 })
      .withMessage("Please provide a description of at least 10 characters."), // on error this message is sent.

    // inv_price is required and must be a positive number
    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid price."),

    // inv_miles is required and must be a positive integer
    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Please provide valid miles."),

    // inv_color is required and must be string
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Please provide a color of at least 3 characters."), // on error this message is sent.
  ]
}

validate.addClassificationRules = () => {
  return [
    // classification_name is required and must be string
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Please provide a classification name of at least 3 characters."), // on error this message is sent.
  ]
}

/* ******************************
* Check data and return errors or continue to inventory processing
* ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    const data = await invModel.getClassifications()
    const classifications = data.rows
      
    const nav = await utilities.getNav()
      
    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classifications,
      errors: errors.array(),
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
    })
  }
  next()
}

/* ******************************
* Check update data and return errors or continue to inventory processing
* ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    const data = await invModel.getClassifications()
    const classifications = data.rows
      
    const nav = await utilities.getNav()
      
    return res.render("inventory/edit-inventory", {
      title: "Edit Inventory",
      nav,
      classifications,
      errors: errors.array(),
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
    })
  }
  next()
}



module.exports = validate