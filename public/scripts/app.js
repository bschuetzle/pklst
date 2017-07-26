$(document).ready(function() {

  console.log("app.js document is ready")

  displayOrders()
  
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
