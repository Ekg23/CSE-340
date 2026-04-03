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

router.get("/add-inventory", invController.buildAddInventory)

// Route to managemennt
router.get("/", invController.buildManagement)

// Route to add classification
router.get("/add-classification", invController.buildAddClassification)

// Handle form submission
router.post("/add-classification", addValidate.addClassificationRules(), utilities.handleErrors(invController.addClassification));

// Route to add inventory
router.post("/add-inventory", addValidate.addInventoryRules(), addValidate.checkInventoryData, utilities.handleErrors(invController.addInventory))




module.exports = router;