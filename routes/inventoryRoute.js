//Needed Resources
const express = require('express');
const router = new express.Router();
const invController = require('../controllers/invController');
const addValidate = require('../utilities/inventory-validation');
const utilities = require("../utilities/")

//Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to get vehicle detail by ID
router.get("/detail/:inv_id", invController.buildByInventoryId);

router.get("/add-inventory", utilities.checkJWTToken, utilities.checkEmployee, invController.buildAddInventory)

// Route to managemennt
router.get("/", utilities.checkJWTToken,invController.buildManagement)

// Route to add classification
router.get("/add-classification", utilities.checkJWTToken, utilities.checkEmployee, invController.buildAddClassification)

// Handle form submission
router.post("/add-classification", addValidate.addClassificationRules(), utilities.handleErrors(invController.addClassification));

// Route to add inventory
router.post("/add-inventory", addValidate.addInventoryRules(), addValidate.checkInventoryData, utilities.handleErrors(invController.addInventory))

// Route to get inventory by classification as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

/***************************************
 * Route to build edit inventory view
 ***************************************/
router.get(
    "/edit/:inv_id",
    utilities.checkJWTToken,
    utilities.checkEmployee,
    utilities.handleErrors(invController.editInventoryView)
)
// Route to update inventory
router.post("/update/", addValidate.addInventoryRules(), addValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory))


// Route to delete inventory
router.get(
  "/delete/:inv_id",
  utilities.handleErrors(invController.deleteInventoryView)
)

router.post("/delete/", utilities.handleErrors(invController.deleteInventory))

module.exports = router;