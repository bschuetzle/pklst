$(document).ready(function() {

  console.log("app.js document is ready")

  // displayOrders()

});



$(document).on("click", ".order-search-button", function(e) {
  orderNumber = $(".order-search-input").val();
  console.log("Find button clicked with order number: " + orderNumber);
  if (orderNumber == "") {
    $("body").append("Please enter an order number");
  } else {
    
    $.ajax({
      method: 'GET',
      url: '/api/orders/' + orderNumber,
      success: function(json) {
        if (json.length != 0) {
          $("body").append("Order was found, customer is: " + json[0].customerName);
        } else {
          $("body").append("Order number was not found");
        }
      },
      error: function() {
        $("body").append("Error: some other error");
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
