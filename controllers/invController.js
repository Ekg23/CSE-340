const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* * ******************************************
 *  Build inventory by classification view
 * ****************************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " Vehicles",
        nav,
        grid,
    })
}

invCont.buildByInventoryId = async function (req, res, next) {
    const inv_id = req.params.inv_id;
    const data = await invModel.getInventoryById(inv_id);
    const nav = await utilities.getNav();
    const vehicleHTML = utilities.buildVehicleDetail(data);
    const name = `${data.inv_make} ${data.inv_model}`;
    res.render("inventory/detail", {
        title: name,
        nav,
        vehicleHTML,
    });
}



//Build management view
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    message: req.flash("notice"),
    error: null
  })
}


invCont.buildAddClassification = async function (req, res, next) {
    const nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    message: req.flash("notice"),
    classification: {}  // empty object for sticky form inputs
  });
};

// Handle form submission
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body;  // safe in POST

  const result = await invModel.insertClassification(classification_name);

  if (result.rowCount > 0) {
    req.flash("notice", `Classification "${classification_name}" added successfully.`);
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Failed to add classification.");
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: req.flash("notice"),
      classification: { classification_name } // sticky input
    });
  }
};


invCont.buildAddInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const data = await invModel.getClassifications() // returns array of {classification_id, classification_name}
  const classifications = data.rows

  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classifications,
    errors: null,
    inventory: {} // empty object for sticky inputs
  })
}


invCont.addInventory = async function (req, res) {
  const { body } = req;

  // Check for validation errors from middleware
  if (req.errors && req.errors.length > 0) {
    // If errors exist, re-render the form with errors and sticky fields
    const nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();
    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classifications,
      errors: req.errors, // Show validation errors
      inventory: body, // Sticky inputs
    });
  }

  // If no errors, proceed to insert the vehicle
  const result = await invModel.insertInventory(body);

  if (result) {
    const nav = await utilities.getNav();
    req.flash("notice", `Vehicle "${body.inv_make} ${body.inv_model}" added successfully.`);
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message: req.flash("notice")
    });
  } else {
    const nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();
    req.flash("notice", "Failed to add vehicle.");
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classifications,
      inventory: body, // sticky input values
      errors: null, // fallback, though validation errors should have been handled already
    });
  }
};

module.exports = invCont;