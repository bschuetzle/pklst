
var pickList;


$(document).ready(function() {

  console.log("app.js document is ready")

});


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
    $(".order-search-msg").append("Please enter an order number");
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
          $(".order-search-msg").append("Order number was not found");
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
        <h1>PKLST</h1>

        <div class="item-search-cont">
          <label for="item search">Item Number</label>
          <input type="text" name="item search" class="item-search-input" placeholder="scan item number">
          <button type="button" class="item-search-button">Pack</button>
        </div>
      `

      var htmlMsg = `
        <div class="item-search-msg">
        </div>
      `

      var htmlOrder = `
        <div class="picklist-order">
          Order Number: <div class="picklist-order-number">${orderNumber}</div>
        </div>
      `

      var htmlList = "";
      json.forEach(function(element, index) {
        htmlList = htmlList + `
          <p class="picklist-item" data-id="${element.itemID}">
            <div class="picklist-item item-number" data-id="${element.itemID}">${element.itemNumber}</div>
            <div class="picklist-item description" data-id="${element.itemID}">${element.description}</div>
            <div class="picklist-item orderedQty" data-id="${element.itemID}">${element.orderedQty}</div>
            <div class="picklist-item pickedQty" data-id="${element.itemID}">${element.pickedQty}</div>
          </p>
        `;
      });

      $("body").empty();
      $("body").append(htmlHeader + htmlMsg + htmlOrder + htmlList);


    },
    error: function() {
      console.log("error getting data");
    }
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
    $(".item-search-msg").empty();
    if (itemNumber == "") {
      $(".item-search-msg").append("Error: please enter an item number");
    } else if (!validation.found) {
      $(".item-search-msg").append("Error: this item is not in this pick list - do not pack it!");
    } else if (validation.pickedQty == validation.orderedQty) {
      $(".item-search-msg").append("Error: this item has already been fully picked and packed - do not pack it!");
    } else {
      $(".item-search-msg").append("this is valid, we will pick it and update the quantity");
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



}
