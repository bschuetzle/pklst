
# <img src="https://dl.dropboxusercontent.com/s/64w79y0hd9lntwm/pklst-icon.png?dl=0" width="50"> PKLST


PKLST is a warehouse management application that handles the picking and packing of items for customer orders.  It was designed with an emphasis on quality control; to minimize the opportunity for human error (Poke-yoke concept) and to ensure the customer receives all the correct items.  Another goal was to make the process as efficient as possible, mainly by enabling bar code scanning capability.


## Usage

1.  From the home page, scan the order number bar code on the customer order traveller document.  If a carriage return is programmed into the scanner (as the suffix), the next page should come up automatically.  Alternatively, hit the enter key or click on the search button.

2.  Print the pick list of items for that order.  Use that as a shopping list to gather all the items from the shelves.  Click the continue button.

3.  Lay out all the picked items on a large tray, and take a photo.  Click the Select Image button and select the image file.  Click on the image to see a larger view with a caption showing the number of items that should have been picked.  Make sure the number of items ordered matches the number of items shown in the photo.  If satisfied with the photo, click the Save & Continue button, otherwise retake the photo and re-select the file (opportunity here to collect any missing items).  The image will be uploaded to the server and saved to the database.

4.  Scan each item just prior to packing into the box.  Again if the scanner is programmed with a carriage return the Pack button will be clicked automatically, so that this process can be done quickly without the need to touch the keyboard or mouse.  If an item needs to be removed for any reason, enter the item number and click the unpack button (do not scan since the pack button will be clicked automatically).  A color-coded status bar will be displayed at the top (Not Started > In Progress > Completed).  Once all the items have been scanned and packed the status will show as Complete and the Complete button will appear.  Click the Complete button and confirm that all the correct items and quantities have been packed.  The order status will be updated to 'picked' in the database and the homepage will appear, ready for the next order.


## Screenshots

Home Page

<img src="https://dl.dropboxusercontent.com/s/0cdlgvgllmjncqc/home-page.png?dl=0" width="300">

Print Pick List Page

<img src="https://dl.dropboxusercontent.com/s/3x8cs9au6tm9sfq/print-page.png?dl=0" width="300">


Upload Image Page

<img src="https://dl.dropboxusercontent.com/s/fjhgbl2ndrm4wqs/upload-image-page.png?dl=0" width="300">


Pick & Pack Page

<img src="https://dl.dropboxusercontent.com/s/40083l2o3hji11h/pick-pack-page.png?dl=0" width="300">


## Planned New Features

* Add auth (user signup / login) for traceability and to allow configuration specialists to make modifications if needed.
* Add images for individual items that would appear when the operator clicks on row in the pick list.
* Ability to navigate back to previous pages by clicking the step in the footer (with modal asking to confirm).  For example, if the user wanted to go from the Pick & Pack page back to the Upload Image page to re-take the photo.


## Technologies Used

* HTML5
* CSS3
* JavaScript
* Node.js
* Express
* jQuery
* AJAX
* SQL Server
* Sequelize
* PDFKit

## Source Code

(https://github.com/bschuetzle/pklst)
