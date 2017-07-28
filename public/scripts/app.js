
var pickList;


$(document).ready(function() {

  console.log("app.js document is ready");

  setFocusOnOrderInput();

});


function setFocusOnOrderInput() {
  $(".order-search-input").focus();
}

function setFocusOnItemInput() {
  $(".item-search-input").focus();
}

// if the enter key is pressed when the focus is on the search input, perform the search
$(document).on("keypress", ".order-search-input", function(e) {
  if (e.keyCode==13) {
    $(".order-search-button").click();
  }
});


$(document).on("click", ".order-search-button", function(e) {
  orderNumber = $(".order-search-input").val();
  $(".order-search-msg").empty();
  console.log("Find button clicked with order number: " + orderNumber);
  if (orderNumber == "") {
    $(".alert-callout-subtle").removeClass("alert warning");
    $(".alert-callout-subtle").addClass("warning");
    $(".alert-callout-subtle.warning").html(`<strong>Oops!</strong> Please enter an order number.`);
    $(".alert-callout-subtle.warning").css("display", "block");
  }
  else {

    $.ajax({
      method: 'GET',
      url: '/api/orders/' + orderNumber,
      success: function(json) {
        if (json.length != 0) {
          // $(".order-search-msg").append("Order was found, customer is: " + json[0].customerName);
          displayPickList(orderNumber);
        }
        else {
          $(".alert-callout-subtle").removeClass("alert warning");
          $(".alert-callout-subtle").addClass("alert");
          $(".alert-callout-subtle.alert").html(`<strong>Error:</strong> The order number '${orderNumber}' could not be found.`);
          $(".alert-callout-subtle.alert").css("display", "block");
        }
      },
      error: function() {
        $(".order-search-msg").append("Error: some other error");
      }
    });

  }

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
