const express = require("express");
const path = require("path");
// const bodyParser = require('body-parser');
const cookieParser=require("cookie-parser");
const app = express();
const urlRoute = require("./routes/url");
const { connectToMongoDb } = require("./connection");
const PORT = 8001;
const URL = require("./models/url");
const staticRoute = require("./routes/staticRouter");
const userRoute=require("./routes/user")
const {restrictToLoggedinUserOnly,checkAuth}=require("./middleware/auth")






connectToMongoDb("mongodb://127.0.0.1:27017/short-url").then(() => {
  console.log("MongoDb Connected");
});
// app.use({express.urlencoded:false});
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

//Routes

app.use("/url",restrictToLoggedinUserOnly, urlRoute);
app.use("/user",userRoute);
app.use("/",checkAuth, staticRoute);



app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamps: Date.now(),
        },
      },
    }
  );

  //     if (entry && entry.redirectUrl) {
  //         // If entry exists and has a redirectUrl property, redirect
  res.redirect(entry.redirectUrl);
  //     } else {
  //         // If entry is null or doesn't have a redirectUrl property, handle the error
  //         res.status(404).send("URL not found");
  //     }
  // } catch (error) {
  //     // Handle any other errors that may occur during the database query
  //     console.error("Error retrieving URL from database:", error);
  //     res.status(500).send("Internal Server Error");
  // }
});

app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
