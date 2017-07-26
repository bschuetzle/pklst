$(document).ready(function() {

  console.log("app.js document is ready")

  // displayOrders()

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
  } else {

    $.ajax({
      method: 'GET',
      url: '/api/orders/' + orderNumber,
      success: function(json) {
        if (json.length != 0) {
          $(".order-search-msg").append("Order was found, customer is: " + json[0].customerName);
        } else {
          $(".order-search-msg").append("Order number was not found");
        }
      },
      error: function() {
        $(".order-search-msg").append("Error: some other error");
      }
    });

  }

});


function displayOrders() {
  $.ajax({
    method: 'GET',
    url: '/api/orders',
    success: function(json) {

      json.forEach(function(element, index) {
        var appendStr = `<li><a href="#" class="project-dropdown-items" data-id="${element.id}">${element.orderNumber}</a></li>`;
        $("body").append(appendStr);
      });

    },
    error: function() {
      console.log("error getting orders");
    }
  });
}
