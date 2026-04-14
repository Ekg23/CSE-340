invModel = require("../models/inventory-model")
const jwt = require('jsonwebtoken');
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* ***************************************
 * Build the classification view HTML
 ************************************** */
Util.buildClassificationGrid = async function(data) {
    let grid
    if (data.length > 0){
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href"../../inv/detail/'+ vehicle.inv_id 
            + '" title="View' + vehicle.inv_make + ' '+ vehicle.inv_model
            + 'details"><img src="' + vehicle.inv_thumbnail
            +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model
            +' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$' 
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'    
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}


/* ***************************************
 * Build the vehicle detail view HTML
 ************************************** */
Util.buildVehicleDetail = function (data) {
  let html = "";

  if (data) {
    html += '<div class="vehicle-detail">';
    
    html += '<div class="vehicle-image">';
    html += `<img src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model}">`;
    html += "</div>";

    html += '<div class="vehicle-info">';
    html += `<h2>${data.inv_year} ${data.inv_make} ${data.inv_model}</h2>`;
    
    html += `<p><strong>Price:</strong> $${new Intl.NumberFormat().format(data.inv_price)}</p>`;
    html += `<p><strong>Mileage:</strong> ${new Intl.NumberFormat().format(data.inv_miles)} miles</p>`;
    html += `<p><strong>Color:</strong> ${data.inv_color}</p>`;
    html += `<p><strong>Description:</strong> ${data.inv_description}</p>`;
    
    html += "</div>";
    html += "</div>";
  }

  return html;
};

/* ***************************************
 * Build the classification select list HTML
 ************************************** */
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
      '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
  }



/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
    res.clearCookie("jwt")
    res.locals.loggedin = false
    return next()  
    }
    res.locals.accountData = accountData
    res.locals.loggedin = true
    next()
   })
 } else {
  res.locals.loggedin = false
  next()
 }
}


/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}


/* ****************************************
 *  Check Employee or Admin Access
 * **************************************** */
Util.checkEmployee = (req, res, next) => {
  try {
    const accountData = res.locals.accountData
    if (accountData.account_type === "Employee" || accountData.account_type === "Admin") {
      next()
    } else {
      req.flash("notice", "You do not have permission to access this page.")
      return res.redirect("/account/login")
    }
  } catch (error) {
    req.flash("notice", "An error occurred while checking your permissions.")
    return res.redirect("/account/login")
  }
}

module.exports = Util