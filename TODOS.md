A way to better keep track of features that need to be developed or need to change.

Items in progress or deferred for later are marked with \[\-\], or a clock emoji, which is at least how
it appears on neovim.

> [!NOTE]
> This list itself is subject to change. Items with a question mark at the end need further elaboration.

# Pending

## Products
- [ ] Promo codes
- [ ] Custom tags for personalized SEO
- [x] Add explicit stock quantity (+ changes when checking out and maybe when adding to cart)
  - [-] Update the quantity on checkout, and prevent from adding an out of stock item to cart
- [ ] Search feature
  - [ ] Search filters
- [ ] Fix main image selection (currently it's simply the latest one added)
- [ ] Add image reordering feature
- [ ] "Fake" checkout
  - [ ] See if payment services provide APIs purely for dev learning
- [ ] Show related products when viewing different product
- [ ] Delete product functionality (maybe make it so it's not deleted but simply unlist the entries)
- [ ] Add button to report product listings
- [ ] Further work on reviews
  - [ ] Add ability to edit and remove comments (+ add edit date metadata)
  - [ ] Add ability for sellers to respond to reviews
- [ ] Q/A section, should work similarly to reviews minus the scoring
- [ ] Further work on product description field
  - [ ] Add markdown
  - [ ] Add more advanced editing features
- [ ] Ability to edit products from their own pages (*low priority*)

## Users
- [ ] Disable sign-ups with disposable e-mails if possible
- [x] Fix cart size not re-fetching as soon as user login, without reloading the page
- [ ] Wishlist functionality
  - [ ] Email + inbox alert when product goes on sale (?)
- [ ] Password recovery
- [ ] User verification
  - [ ] E-mail verification on sign-up (***VERY low priority***, requires dealing with third-party services)
  - [ ] Verification to post item listings (maybe make a permissions bitmask on the back end)
- [ ] Verified seller checkmarks (?)
- [ ] User report buttons
  - [ ] On their profile
  - [ ] On reviews
  - [ ] ... everywhere else they might appear

## Dashboard
- [ ] Mod / admin dashboard
  - [ ] User management
  - [ ] View user reports
  - [ ] Admin site-wide management tools (*low priority*, this can get quite complex, leave for last)
  - [ ] Permission flags for different moderator types?
  - [ ] User feedback (?)
- [ ] Mod tools
- [ ] Simple private messaging system
  - [-] PM button on navbar
  - [ ] Buyer + seller communication
  - [ ] Mod to user communication
  - [ ] Specific system messages

# Bugs
- [ ] Users are not being redirected after a successful sign-up
- [ ] Auth wrapper login check method does not trigger an update on its children if the logged in status changes, as it's not tied to a react state
