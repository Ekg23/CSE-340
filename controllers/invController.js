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
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    message: req.flash("notice"),
    error: null,
    classificationSelect
  })
}


invCont.buildAddClassification = async function (req, res, next) {
    const nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    message: req.flash("notice"),
    errors: null,
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
    const classificationSelect = await utilities.buildClassificationList(); 

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


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

invCont.buildEditInventory = async (req, res) => {
  let nav = await utilities.getNav()
  const inv_id = req.params.inv_id

  res.render("inventory/edit-inventory", {
    title: "Edit Inventory",
    nav,
    errors: null,
    inv_id
  })
}



/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const message = req.flash("notice")
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    message,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    message: req.flash("notice"),
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}



/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const message = req.flash("notice")
  const itemData = await invModel.getInventoryById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    message,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}


/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)

  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    req.flash("notice", "The vehicle was successfully deleted.")
    return res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    return res.redirect(`/inv/delete/${inv_id}`)
  }
}

module.exports = invCont;