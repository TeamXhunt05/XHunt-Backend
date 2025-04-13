**TABLE**

1. user_profile_models
2. user_login_infos
3. tags
4. pages
5. organization_models
6. category_models
7. pin_model
8. order_model
9. store_model
10. product_model
11. UserWalletModel
12. MostLovedPins

//AGREGATION

13. LogsSchema
14. RatingModel
15. FavouriteModel
16. FavouriteProductModel

//authentication

17. Language 



18. Images ✅
19. UserLoginInfo ✅
20. OrganizationModel ✅
21. StoreReviewsModel ✅
22. StoreModel ✅
23. UserProfileModel ✅
24. UserLocationModel ✅
25. RatingModel

//payment

27. Language ✅
28. Images ✅
29. UserLoginInfo ✅
30. OrganizationModel ✅
31. StoreReviewsModel
32. StoreModel ✅
33. UserProfileModel ✅
34. UserLocationModel ✅
35. FavouriteModel ✅
36. RatingModel ✅




**FOR STORE FUNCTIONALITY**

1. STORE = ONLY ONE ,  EDIT , VIEW
2. PIN = ADD EDIT DELETE
3. PRODUCT => ADD EDIT DELETE UPDATE
4. ORDER LIST
5. ADD ACCOUNT DETAILS
6. RETURN & REFUND & 
7. WALLET


8. BULK PRODUCT
9. BULK PINS



**FOR ADMIN FUNCTIONALITY**
1. LIST OF USER
2. LIST OF STORE => ADD EDIT DELETE
3. LIST PINS => 
4. LIST PRODUCTS => 
5. LIST ORDER LIST =>
6. PAYMENT RETURN REFUND
7. WALLET


8. BULK PRODUCT
9. BULK PINS




PIN CREATE 
image => create or not   && not
products= insert or note
category = create or not******* 
schedule_type => create or not   hide*****
schedule_days => create or not   hide****
start_time   => create or not
end_time   => create or not*****
latitude => lat long
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: '' },
  pin: { type: String, default: '' },
  payment_type
  is_approved_by_admin 



  is_approved_by_admin : 
  publish:
  delete  edit



  Pin Type : Hide
  Pin Offer Type : HIDE
  Pin Latitude : Hide
  Pin Longitude : Hide



  ✅title
  ✅Description
  ✅Pin Type 
  ✅Pin Offer Type
  ✅Pin Min Transaction Value
  ✅Pin Max Discount Value
  ✅Pin Discount Amount
  ✅Pin Discount Unit
  store ✅
  ✅lat long ✅ => Auto get From Store
  is_published  > Active Deactive
  is_approved_by_admin => Approved ADMIN




  products
  categories
  schedule_type
  schedule_days
  start_time
  end_time
  is_limited_available
  city
  country
  pin
  images
  location
  meta_info





  Create New Product
  ✅image
  ✅title
  ✅Description
  ✅ Unit
  ✅ Pieace
  store  ✅ 
  tags ✅ 







  currency hide => INR
  category => By Default
  sub category => By Default
  available items




**MOBILE APIS**
1. REGISTER  => API
1. LOGIN  => API
1. PHONE LOGIN  => API
1. SOCIAL LOGIN  => API
1. CHANGE PASSWORD  => API
1. FORGOT PASSWORD  => API
1. PROFILE DETAILS  => API


2. ALL PIN API  => API
3. STORE DETAILS => API


4. ADD TO CART => API
5. REMOVE TO CART => API


6. ADD FAVORITE PIN => API
7. GET FAVORITE PIN => API



8. ADD FAVORITE TO PRODUCT  => API
9. GET FAVORITE TO PRODUCT  => API


10. STORE REVIEW => API













    io.on('connection', (socket) => {
        console.log('New client connected');
      
        // Get all pins
        socket.on('getPins', async () => {
          try {
        console.log("🚀 ~ file: socket.js:30 ~ socket.on ~ getPins:", getPins)
    return
            const getPins = await Pin.find();
            socket.emit('getPins', getPins);
          } catch (err) {
            console.log(err);
          }
        });
    
    
    
      
        // Add a new pin
        socket.on('pinAdd', async (data) => {
          try {
            const pinAdd = new Pin(data);
            await pinAdd.save();
            socket.emit('pinAdd', pinAdd);
          } catch (err) {
            console.log(err);
          }
        });
      
        // Update a pin
        socket.on('pinEdit', async (id, data) => {
          try {
            const pinEdit = await Pin.findByIdAndUpdate(id, data);
            socket.emit('pinEdit', pinEdit);
          } catch (err) {
            console.log(err);
          }
        });
      
        // Delete a pin
        socket.on('pinDelete', async (id) => {
          try {
            await Pin.findByIdAndDelete(id);
            socket.emit('pinDelete', id);
          } catch (err) {
            console.log(err);
          }
        });
      
        socket.on('disconnect', () => {
          console.log('Client disconnected');
        });
      });









1. GET_PIN_DETAILS 
	method:- url +/id => get
2. Add_Cart
	 
	=> method post 
Body Data	Map jsonPostProduct = {
                            "product": proID,
                            "quantity": products?.cartQuantity,
                          };

                          Map jsonPost = {
                            "pin": pinID,
                            "product_info": jsonPostProduct,
                          };

3. Get_Cart 
	=> method get
                    




  ******ADMIN UPDATE*********
STORE DASHBOARD
ALL STORE DEATILS WITH LOGO 
CARD IN SINGLE LINE


STORE MANAGEMNT FIX

ADD SIDEBAR
LAST MINUTES
FLAT MINTUES



  Store Lat Long
  Address Not change     


  Verification Step Stop After Store Add       

  Store View Page => Add Reatier Deatils => Map View      






  1. /inventory/wallet/ => saved data 
2. /my/cart               => Done
3. Create_Order
4. /auth/user-profile/"   => Done
5. /aggregation/upload/

7. api/auth/verify-account/<uid>/<token>"






ORDER
6. /payment/StoreBillingPayment/
7. payment/updatehandlepayment/
