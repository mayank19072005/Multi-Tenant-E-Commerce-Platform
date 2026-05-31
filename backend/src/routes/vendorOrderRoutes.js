const express =
  require("express");

const router =
  express.Router();

const {
  updateOrderStatus
} = require(
  "../controllers/vendorOrderController"
);

router.put(
  "/:id/status",
  updateOrderStatus
);

module.exports = router;
