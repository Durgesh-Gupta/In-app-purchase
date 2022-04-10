const express = require("express");
const router = express.Router();
const axios = require("axios");
var jwt = require("jsonwebtoken");
const fs = require("fs");
let privateKey = fs.readFileSync(__dirname + "/jwtRS256.key");

router.post("/checkreceipt", async (req, res) => {
  let Receipt = req.body || Receipt;

  try {
    if (!Receipt?.originalTransactionId) {
      throw new Error("Not a Valid Receipt!");
    }
    let payload = {
      iss: "57246542-96fe-1a63e053-0824d011072a",
      iat: 1623085200,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      aud: "appstoreconnect-v1",
      bid: "com.example.testbundleid2021",
    };

    let response = await getSubscription(
      Receipt.originalTransactionId,
      payload
    );
    if (response?.data[0]?.lastTransactions[0].status == 1) {
      res.json({ sucessCode: 201, data: "Subscription is Valid" });
    } else {
      res.json({ sucessCode: 201, data: "Subscription is expire!" });
    }
  } catch (e) {
    console.log(e.message);
    res.json({ sucess: "Failed", message: e.message });
  }
});

let Receipt = {
  transactionId: "1000000831360853",
  originalTransactionId: "1000000806937552",
  webOrderLineItemId: "1000000063561721",
  bundleId: "com.adapty.sample_app",
  productId: "basic_subscription_1_month",
  subscriptionGroupIdentifier: "27636320",
  purchaseDate: 1624446341000,
  originalPurchaseDate: 1619686337000,
  expiresDate: 1624446641000,
  quantity: 1,
  type: "Auto-Renewable Subscription",
  appAccountToken: "fd12746f-2d3a-46c8-bff8-55b75ed06aca",
  inAppOwnershipType: "PURCHASED",
  signedDate: 1624446484882,
  offerType: 2,
  offerIdentifier: "basic_subscription_1_month.pay_as_you_go.3_months",
};
async function getSubscription(originalTransactionId, payload) {
  try {
    var token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
    const response = await axios.get(
      `https://api.storekit.itunes.apple.com/inApps/v1/subscriptions/${originalTransactionId}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    return response;
  } catch (error) {
    console.error(error.message);
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
    return false;
  }
}

module.exports = router;
