

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
  console.log("retest of browerify/watchify");

  $('.modal').modal();

  $('.tooltipped').tooltip({delay: 50});

  setFocusOnOrderInput();

  setFooterItemsFormat([1]);

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

    <main>

      <div class="container search-page-container">

        <div class="row search-row">
          <div class="col s6 offset-s3 order-search-label">
            Order Number
          </div>
          <div class="col s5 offset-s3">
            <div class="input-field">
              <input type="text" class="order-search-input" placeholder="scan order number">
            </div>
          </div>
          <div class="col s1">
            <button type="button" class="btn waves-effect grey darken-1 order-search-button">
              <i class="large material-icons center order-search-icon">search</i>
            </button>
          </div>
          <div class="col s6 offset-s3">
            <div class="alert-container">
              <div data-closable class="callout alert-callout-subtle alert">
                <strong>Error!</strong>  Alert Alert
              </div>
            </div>
          </div>
        </div>


      </div>


    </main>


    <footer class="page-footer blue-grey lighten-5">

      <div class="container footer-container">

        <i class="fa fa-file-text-o fa-2x footer-icon footer-page-1-icon" aria-hidden="true"></i>
        <a class="footer-text footer-page-1-text">Enter Order</a>

        <i class="fa fa-long-arrow-right fa-2x footer-arrow footer-page-2-arrow" aria-hidden="true"></i>
        <i class="fa fa-print fa-2x footer-icon footer-page-2-icon" aria-hidden="true"></i>
        <a class="footer-text footer-page-2-text">Print Pick List</a>

        <i class="fa fa-long-arrow-right fa-2x footer-arrow footer-page-3-arrow" aria-hidden="true"></i>
        <i class="fa fa-file-image-o fa-2x footer-icon footer-page-3-icon" aria-hidden="true"></i>
        <a class="footer-text footer-page-3-text">Upload Image</a>

        <i class="fa fa-long-arrow-right fa-2x footer-arrow footer-page-4-arrow" aria-hidden="true"></i>
        <i class="fa fa-check-square-o fa-2x footer-icon footer-page-4-icon" aria-hidden="true"></i>
        <a class="footer-text footer-page-4-text">Pick Items</a>

      </div>

    </footer>



  `

  $("body").empty();
  $("body").append(html);

  setFocusOnOrderInput();

  setFooterItemsFormat([1]);


}


function setFooterItemsFormat(pagesArr) {

  var color = "#00796b"

  for (var i = 0; i < pagesArr.length; i++) {

    var $iconEl = $(`.footer-page-${pagesArr[i]}-text`);
    var $textEl = $(`.footer-page-${pagesArr[i]}-icon`);
    var $arrowEl = $(`.footer-page-${pagesArr[i]}-arrow`);

    $iconEl.css("color", color);
    $textEl.css("color", color);
    $arrowEl.css("color", color);

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
          order.id = json[0].id;
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

    <header>

      <div class="navbar-fixed">
        <nav>
          <div class="nav-wrapper blue-grey darken-3">
            <a class="brand-logo">PKLST</a>
          </div>
        </nav>
      </div>

    </header>

    <main>

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

    </main>

    <footer class="page-footer blue-grey lighten-5">

      <div class="container footer-container">

        <i class="fa fa-file-text-o fa-2x footer-icon footer-page-1-icon" aria-hidden="true"></i>
        <a class="footer-text footer-page-1-text">Enter Order</a>

        <i class="fa fa-long-arrow-right fa-2x footer-arrow footer-page-2-arrow" aria-hidden="true"></i>
        <i class="fa fa-print fa-2x footer-icon footer-page-2-icon" aria-hidden="true"></i>
        <a class="footer-text footer-page-2-text">Print Pick List</a>

        <i class="fa fa-long-arrow-right fa-2x footer-arrow footer-page-3-arrow" aria-hidden="true"></i>
        <i class="fa fa-file-image-o fa-2x footer-icon footer-page-3-icon" aria-hidden="true"></i>
        <a class="footer-text footer-page-3-text">Upload Image</a>

        <i class="fa fa-long-arrow-right fa-2x footer-arrow footer-page-4-arrow" aria-hidden="true"></i>
        <i class="fa fa-check-square-o fa-2x footer-icon footer-page-4-icon" aria-hidden="true"></i>
        <a class="footer-text footer-page-4-text">Pick Items</a>

      </div>

    </footer>

  `

  $("body").empty();
  $("body").append(html);
  // console.log("pdf url:", url);

  $(".pdf-frame").attr("src", url);

  setFooterItemsFormat([1,2]);

}



// move from the pick list pdf print page to the image upload page
$(document).on("click", ".continue-button", function(e) {

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


    <main>

      <div class="container">
        <div class="row">
          <div class="col s6 push-s3 header-container">

            <div class="file-field input-field">
              <div class="btn grey darken-1">
                <i class="material-icons left">image</i>
                <span>Select Image</span>
                <input class="file-picker" type="file" name="sampleFile">
              </div>
              <div class="file-path-wrapper">
                <input class="file-path validate" type="text">
              </div>
            </div>

          </div>
        </div>

        <div class="row">
          <div class="col s12 image-container">
            <a class="waves-effect waves-light light-green darken-3 btn image-upload-button"><i class="material-icons left">save</i>Save & Continue</a>
            <img class="picked-items-image" src="#" alt="" />
          </div>
        </div>

      </div>

    </main>


    <footer class="page-footer blue-grey lighten-5">

      <div class="container footer-container">

        <i class="fa fa-file-text-o fa-2x footer-icon footer-page-1-icon" aria-hidden="true"></i>
        <a class="footer-text footer-page-1-text">Enter Order</a>

        <i class="fa fa-long-arrow-right fa-2x footer-arrow footer-page-2-arrow" aria-hidden="true"></i>
        <i class="fa fa-print fa-2x footer-icon footer-page-2-icon" aria-hidden="true"></i>
        <a class="footer-text footer-page-2-text">Print Pick List</a>

        <i class="fa fa-long-arrow-right fa-2x footer-arrow footer-page-3-arrow" aria-hidden="true"></i>
        <i class="fa fa-file-image-o fa-2x footer-icon footer-page-3-icon" aria-hidden="true"></i>
        <a class="footer-text footer-page-3-text">Upload Image</a>

        <i class="fa fa-long-arrow-right fa-2x footer-arrow footer-page-4-arrow" aria-hidden="true"></i>
        <i class="fa fa-check-square-o fa-2x footer-icon footer-page-4-icon" aria-hidden="true"></i>
        <a class="footer-text footer-page-4-text">Pick Items</a>

      </div>

    </footer>


  `

  $("body").empty();
  $("body").append(html);

  setFooterItemsFormat([1,2,3]);


});


// preview image and show save button when a file is chosen or has changed
$(document).on("change", ".file-picker", function(e) {

  console.log("selected file changed");

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
  // var file = $('.file-picker')[0].files[0];

  // console.log(file);
  // console.log(formData);

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
      console.log("Pick List:");
      console.log(pickList);

      var htmlHeader = `

        <header>

          <div class="navbar-fixed">
            <nav>
              <div class="nav-wrapper blue-grey darken-3">
                <a class="brand-logo">PKLST</a>
              </div>
            </nav>
          </div>

        </header>


        <main>

          <div class="container item-search-container">
            <div class="row">

              <div class="col s12 order-search-label">
                <div class="pick-list-status">In Process</div>
              </div>

              <div class="col s12 order-search-label">
                Item Number
              </div>


              <div class="col s3">

                <div class="input-field">
                  <input type="text" class="item-search-input" placeholder="scan item number">
                </div>

              </div>

              <div class="col s9">

                <button type="button" class="btn waves-effect grey darken-1 picklist-buttons item-pack-button">Pack
                  <i class="large material-icons right" item-search-icon>file_download</i>
                </button>

                <button type="button" class="btn waves-effect grey darken-1 picklist-buttons item-unpack-button">Unpack
                  <i class="large material-icons right" item-search-icon>file_upload</i>
                </button>

                <button type="button" class="btn waves-effect grey darken-1 picklist-buttons order-complete-button">Complete
                  <i class="large material-icons right" item-search-icon>check_box</i>
                </button>

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
          <div class="row pick-list-row">
            <div class="col s12 pick-list-column">
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
      </main>

      `

      htmlFooter = `

        <footer class="page-footer blue-grey lighten-5">

          <div class="container footer-container">

            <i class="fa fa-file-text-o fa-2x footer-icon footer-page-1-icon" aria-hidden="true"></i>
            <a class="footer-text footer-page-1-text">Enter Order</a>

            <i class="fa fa-long-arrow-right fa-2x footer-arrow footer-page-2-arrow" aria-hidden="true"></i>
            <i class="fa fa-print fa-2x footer-icon footer-page-2-icon" aria-hidden="true"></i>
            <a class="footer-text footer-page-2-text">Print Pick List</a>

            <i class="fa fa-long-arrow-right fa-2x footer-arrow footer-page-3-arrow" aria-hidden="true"></i>
            <i class="fa fa-file-image-o fa-2x footer-icon footer-page-3-icon" aria-hidden="true"></i>
            <a class="footer-text footer-page-3-text">Upload Image</a>

            <i class="fa fa-long-arrow-right fa-2x footer-arrow footer-page-4-arrow" aria-hidden="true"></i>
            <i class="fa fa-check-square-o fa-2x footer-icon footer-page-4-icon" aria-hidden="true"></i>
            <a class="footer-text footer-page-4-text">Pick Items</a>

          </div>

        </footer>

      `

      $("body").empty();
      $("body").append(htmlHeader + htmlList + htmlFooter);

      displayPickStatus();

      setFocusOnItemInput();

      setFooterItemsFormat([1,2,3,4]);

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

    var $rowEl = $(`.picklist-row[data-id='${itemID}']`);
    var $iconEl = $(`.pick-status-icon[data-id='${itemID}']`);
    // $rowEl.css("color", "green");
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
    message = `${totalPickedQty} of ${totalOrderedQty} items packed`
    pickList.totalOrderedQty = totalOrderedQty;
    pickList.totalPickedQty = totalPickedQty;
    Materialize.toast(message, 4000);
  }


  $(document).on("click", ".order-complete-button", function(e) {
    console.log("complete button clicked");
    renderHomePage();
  });

}
