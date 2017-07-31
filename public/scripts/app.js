

// imports for pdf generation
var PDF = require('pdfkit');
var fs = require('fs');


// global variables
var pickList;         // holds array of pick item objects (json)
var order = {};       // holds data about the order - orderNumber, customerName, productItemNumber, productDescription
var pickList = {};    // holds data about the pick list - status, total ordered, total picked, etc.
var pdfUrl            // holds url of pdf e.g. blob:http://localhost:3000/14468788-4d9a-45a7-be8e-2aa47dd8e3e6
var currentPage = 1   // keep track of the current page / step



// when index.html has finished loading
$(document).ready(function() {

  console.log("document is ready (in app.js)");

  $('.modal').modal();

  renderHomePage();

});



// MODAL TESTING
$(document).on("click", ".modal-test-button", function(e) {
  $('#modal1').modal('open');
});

$(document).on("click", ".modal-cancel-button", function(e) {
  console.log("cancel modal button clicked");
});

$(document).on("click", ".modal-complete-button", function(e) {
  console.log("complete modal button clicked");
});
// MODAL TESTING


function renderHomePage() {
  $(".home-page").css("display", "inline");
  setFocusOnOrderInput();
}

function setFooterItemsFormat(pagesArr) {
  var color = "#00796b"
  for (var i = 0; i < pagesArr.length; i++) {
    $(`.footer-page-${pagesArr[i]}-text`).css("color", color);
    $(`.footer-page-${pagesArr[i]}-icon`).css("color", color);
    $(`.footer-page-${pagesArr[i]}-arrow`).css("color", color);
  }
}

// move the focus / set the cursor in the order input textbox
function setFocusOnOrderInput() {
  $(".order-search-input").focus();
}

// move the focus / set the cursor in the item input textbox
function setFocusOnItemInput() {
  $(".item-search-input").focus();
}

// execute the order search if the enter key is pressed while focus is in the order input textbox
$(document).on("keypress", ".order-search-input", function(e) {
  if (e.keyCode==13) {
    $(".order-search-button").click();
  }
});

// execute the order search
$(document).on("click", ".order-search-button", function(e) {
  // get the order number from the text input
  orderNumber = $(".order-search-input").val();
  // show the warning message if an order number was not entered / scanned
  if (orderNumber == "") {
    displayErrorMsg("warning", "Oops!", "Please enter an order number.");
  }
  // attempt to find the order
  else {
    $.ajax({
      method: 'GET',
      url: '/api/orders/' + orderNumber,
      success: function(json) {
        // if the order was found, display the pick list (next page)
        if (json.length != 0) {
          order.id = json[0].id;
          order.orderNumber = json[0].orderNumber;
          order.customerName = json[0].customerName;
          order.orderStatus = json[0].orderStatus;
          order.pickedItemsImgFile = json[0].pickedItemsImgFile;
          if (order.orderStatus == "picked") {
            displayErrorMsg("alert", "Error:", `The order number '${orderNumber}' has already been picked.`);
          } else {
            retrievePickList(orderNumber);
          }
        }
        // if the order was not found, show an error message
        else {
          displayErrorMsg("alert", "Error:", `The order number '${orderNumber}' could not be found.`);
        }
      },
      // TODO: if there was a problem with the ajax call, show an error message with the details
      error: function(err) {
        console.log("error:", err);
      }
    });

  }

});


function displayErrorMsg(type, prefix, message) {

  $(".alert-callout-subtle").removeClass("alert warning");
  $(".alert-callout-subtle").addClass(type);
  $(`.alert-callout-subtle.${type}`).html(`<strong>${prefix}</strong> ${message}`);
  $(`.alert-callout-subtle.${type}`).css("display", "block");

}


function retrievePickList(orderNumber) {

  $.ajax({
    method: 'GET',
    url: '/api/ordered_items/' + orderNumber,
    success: function(json) {
      // save/cache response data in global variable
      pickList = json;
      findMainProduct(json);
      generatePDFDoc(json);
      console.log(pickList);
    },
    error: function() {
      console.log("error getting data");
    }
  });

};


function findMainProduct(json) {

  json.forEach(function (element) {
    if (element.itemType == "main") {
      order.productItemNumber = element.itemNumber;
      order.productDescription = element.description;
    }
  });

}


function generatePDFDoc(json) {

  var blobStream = require('blob-stream');
  var blob, url;

  doc = new PDF();

  stream = doc.pipe(blobStream());

  // doc.image('images/company_logo.png', 50, 15);

  doc.fontSize(11);
  doc.text(`Order Number:`, 50, 50);
  doc.text(`Product:`, 50, 70);
  doc.text(`Customer:`, 50, 90);

  doc.text(`${order.orderNumber}`, 140, 50);
  doc.text(`${order.productItemNumber} - ${order.productDescription}`, 140, 70);
  doc.text(`${order.customerName}`, 140, 90);

  doc.fontSize(10);

  doc.text('Item Number', 50, 140, { underline: true });
  doc.text('Description', 150, 140, { underline: true });
  doc.text('Ordered Qty', 460, 140, { underline: true });

  json.forEach(function(element, index) {
    doc.text(element.itemNumber, 50, 160 + (20 * index) );
    doc.text(element.description, 150, 160 + (20 * index) );
    doc.text(element.orderedQty, 485, 160 + (20 * index) );
  });

  doc.end();

  stream.on('finish', function() {

    blob = stream.toBlob('application/pdf');
    url = stream.toBlobURL('application/pdf');
    renderPDFPrintPage(url);

  });

}


function renderPDFPrintPage(url) {

  $(".home-page").css("display", "none");
  $(".pdf-print-page").css("display", "inline");

  $(".pdf-frame").attr("src", url);

  setFooterItemsFormat([1]);

}


// move from the pick list pdf print page to the image upload page
$(document).on("click", ".continue-button", function(e) {

  $(".pdf-print-page").css("display", "none");
  $(".image-upload-page").css("display", "inline");

  setFooterItemsFormat([1,2]);

});


// preview image and show save button when a file is chosen or has changed
$(document).on("change", ".file-picker", function(e) {

  var image = $(".file-picker")[0].files[0];

  var reader = new FileReader();
  reader.onload = function (e) {
    $('.picked-items-image').attr('src', e.target.result);
  }

  reader.readAsDataURL(image);

  $(".image-upload-button").css("visibility", "visible");
  $(".picked-items-image").css("visibility", "visible");

});


// save image file to server and update orders table with the filename
$(document).on("click", ".image-upload-button", function(e) {

  var formData = new FormData();
  formData.append('file', $('.file-picker')[0].files[0]);

  $.ajax({
    method: 'POST',
    url: '/api/uploadimage/' + order.id,
    data: formData,
    processData: false,
    contentType: false,
    success: function(json) {
      displayPickList(order.orderNumber);
    },
    error: function() {
      console.log("error: image upload failed");
    }
  });

});


function displayPickList(orderNumber) {

  $.ajax({
    method: 'GET',
    url: '/api/ordered_items/' + orderNumber,
    success: function(json) {

      pickList = json;

      tableBody = "";

      json.forEach(function(element, index) {

        if (element.pickedQty == element.orderedQty) {
          var icon = "check_circle";
          var color = `style="color: green;"`
        } else {
          var icon = "error_outline";
          var color = `style="color: red;"`
        }

        tableBody = tableBody + `
          <tr class="picklist-row" data-id="${element.itemID}">
            <td class="picklist-item status" style="text-align:center" data-id="${element.itemID}"><i class="small material-icons center pick-status-icon" data-id="${element.itemID}" ${color}>${icon}</i></td>
            <td class="picklist-item item-number" data-id="${element.itemID}">${element.itemNumber}</td>
            <td class="picklist-item description" data-id="${element.itemID}">${element.description}</td>
            <td class="picklist-item orderedQty" style="text-align:center" data-id="${element.itemID}">${element.orderedQty}</td>
            <td class="picklist-item pickedQty" style="text-align:center" data-id="${element.itemID}">${element.pickedQty}</td>
          </tr>
        `

      });

      $(".table-body").empty();
      $(".table-body").append(tableBody);

      $(".image-upload-page").css("display", "none");
      $(".picklist-page").css("display", "inline");

      setFooterItemsFormat([1,2,3]);

      displayPickStatus();

      setFocusOnItemInput();

      if (pickList.status == "Complete") {
        $(".order-complete-button").css("visibility", "visible");
      }

    },
    error: function() {
      console.log("error getting data");
    }
  });


  // if the enter key is pressed when the focus is on the item number input, automatically click the pack button
  $(document).on("keypress", ".item-search-input", function(e) {
    if (e.keyCode==13) {
      $(".item-pack-button").click();
    }
  });


  $(document).on("click", ".item-pack-button", function(e) {

    itemNumber = $(".item-search-input").val();
    var itemInfo = getItemInfo(itemNumber);

    console.log(itemInfo);
    console.log(validateAction(itemNumber, "pack"));

    if (validateAction(itemNumber, "pack")) {
      pickItem(itemInfo.orderID, itemInfo.itemID, itemInfo.pickedQty + 1);
    }

  });


  $(document).on("click", ".item-unpack-button", function(e) {

    itemNumber = $(".item-search-input").val();
    var itemInfo = getItemInfo(itemNumber);

    console.log(itemInfo);
    console.log(validateAction(itemNumber, "unpack"));

    if (validateAction(itemNumber, "unpack")) {
      unpickItem(itemInfo.orderID, itemInfo.itemID, itemInfo.pickedQty - 1);
    }

  });


  function getItemInfo(itemNumber) {
    var itemInfo = {found: false};
    pickList.forEach(function(element, index) {
      if (element.itemNumber == itemNumber) {
        itemInfo.found = true;
        itemInfo.itemNumber = element.itemNumber;
        itemInfo.orderedQty = element.orderedQty;
        itemInfo.orderID = element.orderID;
        itemInfo.itemID = element.itemID;
        itemInfo.pickedQty = element.pickedQty;
      }
    });
    return itemInfo;
  }


  function validateAction(itemNumber, action) {

    if (itemNumber == "") {
      displayErrorMsg("warning", "Oops!", `Please enter an item number.`);
      return false;
    }

    var foundInList = false;
    var hasError = false;

    pickList.forEach(function(element) {
      if (element.itemNumber == itemNumber) {
        foundInList = true;
        if (action == "pack" && (element.pickedQty == element.orderedQty)) {
          displayErrorMsg("alert", "Error:", `The item '${itemNumber}' has already been fully packed - do not pack it!`);
          hasError = true;
        } else if (action == "unpack" && (element.pickedQty == 0)) {
          displayErrorMsg("alert", "Error:", `The item '${itemNumber}' has not been packed yet.`);
          hasError = true;
        }
      }
    });

    if (hasError) {
      return false;
    } else if (!foundInList) {
      displayErrorMsg("alert", "Error:", `The item '${itemNumber}' is not part of this order.`);
      return false;
    } else {
      $(".alert-callout-subtle.alert").css("display", "none");
      $(".alert-callout-subtle.warning").css("display", "none");
      return true;
    }

  }




  function pickItem(orderID, itemID, pickedQty) {

    $.ajax({
      method: 'PUT',
      url: `/api/picked_items/${orderID}/${itemID}/${pickedQty}`,
      success: function(json) {
        console.log("Success updating pick list");
        console.log(json);
        updateCachedPickList(itemID, pickedQty);
        updateDisplayedPickList(itemID, pickedQty);
        flashPickedItem(itemID, pickedQty);
        returnFocusToItemNumber();
        displayPickStatus();
        displayPickCountToast();
        if (pickList.status == "Complete") {
          $(".order-complete-button").css("visibility", "visible");
        }

      },
      error: function() {
        console.log("Error updating pick list");
        console.log(json);
      }
    });

  }


  function unpickItem(orderID, itemID, pickedQty) {

    $.ajax({
      method: 'PUT',
      url: `/api/picked_items/${orderID}/${itemID}/${pickedQty}`,
      success: function(json) {
        console.log("Success updating pick list");
        console.log(json);
        updateCachedPickList(itemID, pickedQty);
        displayPickStatus();
        updateDisplayedPickList(itemID, pickedQty);
        flashPickedItem(itemID, pickedQty);
        returnFocusToItemNumber();
        displayPickCountToast();
        if (pickList.status == "Complete") {
          $(".order-complete-button").css("visibility", "visible");
        } else {
          $(".order-complete-button").css("visibility", "hidden");
        }

      },
      error: function() {
        console.log("Error updating pick list");
        console.log(json);
      }
    });

  }




  // update the picked quantity for the selected item
  function updateCachedPickList(itemID, pickedQty) {

    pickList.forEach(function(element, index) {
      if (element.itemID == itemID) {
        pickList[index].pickedQty = pickedQty;
      }
    });

    console.log(pickList);

  }


  function updateDisplayedPickList(itemID, pickedQty) {

    var $qtyEl = $(`.picklist-item.pickedQty[data-id='${itemID}']`);
    $qtyEl.text(pickedQty);

  }


  function flashPickedItem(itemID, pickedQty) {

    var orderedQty, pickedQty;
    pickList.forEach(function(element, index) {
      if (element.itemID == itemID) {
        orderedQty = element.orderedQty;
        pickedQty = element.pickedQty;
      }
    });

    var $rowEl = $(`.picklist-row[data-id='${itemID}']`);
    var $iconEl = $(`.pick-status-icon[data-id='${itemID}']`);
    // $rowEl.css("color", "green");
    if (pickedQty == orderedQty) {
      $iconEl.text("check_circle");
      $iconEl.css("color", "green");
    } else {
      $iconEl.text("error_outline");
      $iconEl.css("color", "red");
    }


  }


  function returnFocusToItemNumber() {
    $(".item-search-input").val("");
    $(".item-search-input").focus();
  }


  function displayPickStatus() {
    var totalOrderedQty = 0;
    var totalPickedQty = 0;
    var status = "";
    pickList.forEach(function(element, index) {
      totalOrderedQty += element.orderedQty;
      totalPickedQty += element.pickedQty;
    });
    if (totalPickedQty == 0) {
      status = "Not Started";
      $(".pick-list-status").css("background-color", "rgb(255, 198, 179)");
    } else if (totalPickedQty < totalOrderedQty) {
      status = "In Progress";
      $(".pick-list-status").css("background-color", "rgb(255, 255, 204)");
    } else if (totalPickedQty == totalOrderedQty) {
      status = "Complete";
      $(".pick-list-status").css("background-color", "rgb(204, 255, 153)");
    }
    pickList.totalOrderedQty = totalOrderedQty;
    pickList.totalPickedQty = totalPickedQty;
    pickList.status = status;
    $(".pick-list-status").text(status);

  }


  function displayPickCountToast() {
    var totalOrderedQty = 0;
    var totalPickedQty = 0;
    var message = "";
    pickList.forEach(function(element) {
      totalOrderedQty += element.orderedQty;
      totalPickedQty += element.pickedQty;
    });
    message = `${totalPickedQty} of ${totalOrderedQty} items packed`;
    pickList.totalOrderedQty = totalOrderedQty;
    pickList.totalPickedQty = totalPickedQty;
    Materialize.toast(message, 4000);
  }


  $(document).on("click", ".order-complete-button", function(e) {
    console.log("complete button clicked");

    $.ajax({
      method: 'POST',
      url: '/api/order_update/' + order.id,
      success: function(json) {

        renderHomePage();

      },
      error: function() {
        console.log("error updating order");
      }
    });


  });

}


// HTML PARTIALS
// *************


// navbar / header
function getNavbarHTML() {

  var html = `
  <header>

    <div class="navbar-fixed">
      <nav>
        <div class="nav-wrapper blue-grey darken-3">
          <a class="brand-logo">PKLST</a>
        </div>
      </nav>
    </div>

  </header>
  `

  return html;

}
