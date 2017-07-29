

// imports for pdf generation
var PDF = require('pdfkit');
var fs = require('fs');


// global variables
var pickList;       // holds array of pick item objects (json)
var order = {};     // holds data about the order - orderNumber, customerName, productItemNumber, productDescription
var pdfUrl          // holds url of pdf e.g. blob:http://localhost:3000/14468788-4d9a-45a7-be8e-2aa47dd8e3e6


// when index.html has finished loading
$(document).ready(function() {

  console.log("document is ready (in app.js)");
  console.log("retest of browerify/watchify");

  $('.tooltipped').tooltip({delay: 50});

  setFocusOnOrderInput();

});

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
    $(".alert-callout-subtle").removeClass("alert warning");
    $(".alert-callout-subtle").addClass("warning");
    $(".alert-callout-subtle.warning").html(`<strong>Oops!</strong> Please enter an order number.`);
    $(".alert-callout-subtle.warning").css("display", "block");
  }
  // attempt to find the order
  else {
    $.ajax({
      method: 'GET',
      url: '/api/orders/' + orderNumber,
      success: function(json) {
        // if the order was found, display the pick list (next page)
        if (json.length != 0) {
          order.orderNumber = json[0].orderNumber;
          order.customerName = json[0].customerName;
          retrievePickList(orderNumber);
        }
        // if the order was not found, show an error message
        else {
          $(".alert-callout-subtle").removeClass("alert warning");
          $(".alert-callout-subtle").addClass("alert");
          $(".alert-callout-subtle.alert").html(`<strong>Error:</strong> The order number '${orderNumber}' could not be found.`);
          $(".alert-callout-subtle.alert").css("display", "block");
        }
      },
      // TODO: if there was a problem with the ajax call, show an error message with the details
      error: function() {
        $(".order-search-msg").append("Error: some other error");
      }
    });

  }

});


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
  console.log(order);
}


function generatePDFDoc(json) {

  var blobStream = require('blob-stream');
  var blob, url;

  doc = new PDF();

  stream = doc.pipe(blobStream());

  doc.fontSize(12);
  doc.text(`Order Number:  ${order.orderNumber}`, 50, 50);
  doc.text(`Product: ${order.productItemNumber} - ${order.productDescription}`, 50, 70);
  doc.text(`Customer: ${order.customerName}`, 50, 90);

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

  console.log("pdf generated");

}


function renderPDFPrintPage(url) {

  var html = `
    <div class="navbar-fixed">
      <nav>
        <div class="nav-wrapper blue-grey darken-3">
          <a class="brand-logo">PKLST</a>
        </div>
      </nav>
    </div>

    <div class="container">
      <div class="row">
        <div class="col s12 header-container">

          <a class="waves-effect waves-light grey darken-1 btn tooltipped print-button" data-position="top" data-delay="50" data-tooltip="I am a tooltip"><i class="material-icons left">print</i>Print</a>
          <a class="waves-effect waves-light grey darken-1 btn continue-button"><i class="material-icons left">keyboard_tab</i>Continue</a>

        </div>
      </div>
    </div>


    <div class="container">
      <div class="row">
        <div class="col s12 iframe-container">
          <iframe class="pdf-frame" style="border:1px solid grey" title="PDF in an i-Frame" src="" frameborder="1" scrolling="auto" height="1100" width="850" align="center" >
          </iframe>
        </div>
      </div>
    </div>


  `

  $("body").empty();
  $("body").append(html);
  console.log("pdf url:", url);

  $(".pdf-frame").attr("src", url);

}



// move from the pick list pdf print page to the image upload page
$(document).on("click", ".continue-button", function(e) {

  var html = `
    <div class="navbar-fixed">
      <nav>
        <div class="nav-wrapper blue-grey darken-3">
          <a class="brand-logo">PKLST</a>
        </div>
      </nav>
    </div>

    <div class="container">
      <div class="row">
        <div class="col s12 header-container">

          <a class="waves-effect waves-light grey darken-1 btn upload-image-button"><i class="material-icons left">image</i>Select Image File</a>

        </div>
      </div>
    </div>
  `

  $("body").empty();
  $("body").append(html);


});



function displayPickList(orderNumber) {

  $.ajax({
    method: 'GET',
    url: '/api/ordered_items/' + orderNumber,
    success: function(json) {

      pickList = json;
      console.log("Pick List:");
      console.log(pickList);

      var htmlHeader = `
        <div class="navbar-fixed">
          <nav>
            <div class="nav-wrapper blue-grey darken-3">
              <a class="brand-logo">PKLST</a>
            </div>
          </nav>
        </div>


        <div class="container item-search-container">
          <div class="row">

            <div class="col s12 order-search-label">
              Item Number
            </div>

            <div class="col s3">
              <div class="input-field">
                <input type="text" class="item-search-input" placeholder="scan item number">
              </div>
            </div>

            <div class="col s2">
              <button type="button" class="btn waves-effect grey darken-1 item-search-button">Pack
                <i class="large material-icons right" item-search-icon>file_download</i>
              </button>
            </div>

            <div class="col s5">
            </div>

            <div class="col s2">
              <div class="pick-list-status">In Process</div>
            </div>

            <div class="col s12">
              <div class="alert-container">
                <div data-closable class="callout alert-callout-subtle alert">
                  <strong>Error!</strong>  Alert Alert
                </div>
              </div>
            </div>

          </div>

        </div>

      `

      var htmlList = `
      <div class="container pick-list-container">
        <div class="row">
          <div class="col s12">
            <table class="highlight bordered">
              <thead>
                <tr>
                  <th style="text-align:center">Status</th>
                  <th>Item Number</th>
                  <th>Description</th>
                  <th style="text-align:center">Ordered Qty</th>
                  <th style="text-align:center">Picked Qty</th>
                </tr>
              </thead>

              <tbody>
      `
      json.forEach(function(element, index) {

        if (element.pickedQty == element.orderedQty) {
          var icon = "check_circle";
          var color = `style="color: green;"`
        } else {
          var icon = "error_outline";
          var color = ""
        }

        htmlList = htmlList + `
          <tr class="picklist-row" data-id="${element.itemID}">
            <td class="picklist-item status" style="text-align:center" data-id="${element.itemID}"><i class="small material-icons center pick-status-icon" data-id="${element.itemID}" ${color}>${icon}</i></td>
            <td class="picklist-item item-number" data-id="${element.itemID}">${element.itemNumber}</td>
            <td class="picklist-item description" data-id="${element.itemID}">${element.description}</td>
            <td class="picklist-item orderedQty" style="text-align:center" data-id="${element.itemID}">${element.orderedQty}</td>
            <td class="picklist-item pickedQty" style="text-align:center" data-id="${element.itemID}">${element.pickedQty}</td>
          </tr>
        `
      });

      htmlList = htmlList + `
                </tbody>
              </table>
            </div>
          </div>
      </div>
      `

      $("body").empty();
      $("body").append(htmlHeader + htmlList);

      displayPickStatus();

      setFocusOnItemInput();

    },
    error: function() {
      console.log("error getting data");
    }
  });


  $(document).on("click", ".item-print-button", function(e) {
    window.print();
  });


  // if the enter key is pressed when the focus is on the item number input, automatically click the pack button
  $(document).on("keypress", ".item-search-input", function(e) {
    if (e.keyCode==13) {
      $(".item-search-button").click();
    }
  });

  $(document).on("click", ".item-search-button", function(e) {
    orderNumber = $(".picklist-order-number").text();
    itemNumber = $(".item-search-input").val();
    console.log("Pack button clicked with order number: " + orderNumber + ", item number: " + itemNumber);
    console.log(pickList);
    var validation = findPickListItem(itemNumber);
    console.log(validation);
    console.log("Found? " + validation.found);
    if (itemNumber == "") {
      $(".alert-callout-subtle").removeClass("alert warning");
      $(".alert-callout-subtle").addClass("warning");
      $(".alert-callout-subtle.warning").html(`<strong>Oops!</strong> Please enter an item number.`);
      $(".alert-callout-subtle.warning").css("display", "block");
    } else if (!validation.found) {
      $(".alert-callout-subtle").removeClass("alert warning");
      $(".alert-callout-subtle").addClass("alert");
      $(".alert-callout-subtle.alert").html(`<strong>Error:</strong> This item is not part of this order - do not pack it!`);
      $(".alert-callout-subtle.alert").css("display", "block");
    } else if (validation.pickedQty == validation.orderedQty) {
      $(".alert-callout-subtle").removeClass("alert warning");
      $(".alert-callout-subtle").addClass("alert");
      $(".alert-callout-subtle.alert").html(`<strong>Error:</strong> This item has already been fully picked and packed - do not pack it!`);
      $(".alert-callout-subtle.alert").css("display", "block");
    } else {
      $(".alert-callout-subtle.alert").css("display", "none");
      $(".alert-callout-subtle.warning").css("display", "none");
      pickItem(validation.orderID, validation.itemID, validation.pickedQty + 1);
    }
  });

  function findPickListItem(itemNumber) {
    var results = {found: false, itemNumber: "", orderID: 0, itemID: 0, orderedQty: 0, pickedQty: 0};
    pickList.forEach(function(element, index) {
      // console.log("Item Number: " + element.itemNumber);
      if (element.itemNumber == itemNumber) {
        results["found"] = true;
        results["itemNumber"] = element.itemNumber;
        results["orderedQty"] = element.orderedQty;
        results["orderID"] = element.orderID;
        results["itemID"] = element.itemID;
        results["pickedQty"] = element.pickedQty;
        // return results;
      }
    });
    return results;
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
      },
      error: function() {
        console.log("Error updating pick list");
        console.log(json);
      }
    });

  }

  function updateCachedPickList(itemID, pickedQty) {

    pickList.forEach(function(element, index) {
      // console.log("Item Number: " + element.itemNumber);
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

    var $rowEl = $(`.picklist-row[data-id='${itemID}']`);
    var $iconEl = $(`.pick-status-icon[data-id='${itemID}']`);
    $rowEl.css("color", "green");
    $iconEl.text("check_circle");
    $iconEl.css("color", "green");

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
    $(".pick-list-status").text(status);

  }

}
