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

      var htmlHeader = `
        <h1>PKLST</h1>

        <div class="item-search-cont">
          <label for="item search">Item Number</label>
          <input type="text" name="item search" class="item-search-input" placeholder="scan item number">
          <button type="button" class="item-search-button">Pack</button>
        </div>

        <div class="item-search-msg">

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
          <p class="picklist-item" data-id="${element.itemNumber}">
            <div class="picklist-item item-number">${element.itemNumber}</div>
            <div class="picklist-item description">${element.description}</div>
            <div class="picklist-item orderedQty">${element.orderedQty}</div>
            <div class="picklist-item pickedQty">${element.pickedQty}</div>
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
  });



}
