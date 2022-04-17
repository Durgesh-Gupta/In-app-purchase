const express = require("express");
const router = express.Router();
const axios = require("axios");
var jwt = require("jsonwebtoken");
const fs = require("fs");
let privateKey = fs.readFileSync(__dirname + "/jwtRS256.key");
// https://purchase-validator.herokuapp.com/
require("dotenv").config();

class Validator {
  constructor(key_id, bundle_id, issuer_id) {
    this.key_id = key_id;
    this.bundle_id = bundle_id;
    this.issuer_id = issuer_id;
  }
}

router.post("/checkreceipt", async (req, res) => {
  let Receipt = req.body || Receipt;


  try {
    // if (!Receipt?.originalTransactionId) {
    //   throw new Error("Not a Valid Receipt!");
    // }
    // let payload = {
    //   iss: "57246542-96fe-1a63e053-0824d011072a",
    //   iat: 1623085200,
    //   exp: Math.floor(Date.now() / 1000) + 60 * 60,
    //   aud: "appstoreconnect-v1",
    //   bid: "com.example.testbundleid2021",
    // };

    // let response = await getSubscription(
    //   Receipt.originalTransactionId,
    //   payload
    // );
    // if (response?.data[0]?.lastTransactions[0].status == 1) {
    //   res.json({ sucessCode: 201, data: "Subscription is Valid" });
    // } else {
    //   res.json({ sucessCode: 201, data: "Subscription is expire!" });
    // }

    var url = true ? "buy.itunes.apple.com" : "sandbox.itunes.apple.com";
    var receiptEnvelope = {
      "receipt-data": Receipt,
      password: process.env.password,
      "exclude-old-transactions": false,
    };
    var receiptEnvelopeStr = JSON.stringify(receiptEnvelope);
    var options = {
      host: url,
      port: 443,
      path: "/verifyReceipt",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(receiptEnvelopeStr),
      },
    };

    var response = await axios.post(`${url}/verifyReceipt`, receiptEnvelope, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(receiptEnvelopeStr),
      },
    });
    let message;
    switch (response.status) {
      case 0:
        message = "Receipt is valid";
        break;
      case 21002:
        message =
          "The data in the receipt-data property was malformed or the service experienced a temporary issue. Try again.";
        break;
      case 21003:
        message = "The receipt could not be authenticated.";
        break;
      case 21004:
        message =
          "The shared secret you provided does not match the shared secret on file for your account.";
        break;
      case 21005:
        message =
          "The receipt server was temporarily unable to provide the receipt. Try again.";
        break;
      case 21006:
        message = "This receipt is valid but the subscription has expired.";
        break;
      case 21007:
        message =
          "This receipt is from the test environment, but it was sent to the production environment for verification.";
        break;
      case 21008:
        message =
          "This receipt is from the production environment, but it was sent to the test environment for verification.";
        break;
      case 21009:
        message = "Internal data access error. Try again later.";
        break;
      case 21010:
        message = "The user account cannot be found or has been deleted.";
        break;

      default:
      // code block
    }
    res.json({ sucess: true, message: message, data: response });
  } catch (e) {
    console.log(e.message);
    res.json({ status: "Failed", message: e });
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
    var token = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      header: {
        alg: "RS256",
        kid: process.env.key_id,
        typ: "JWT",
      },
    });
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
