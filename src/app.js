require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const uuid = require("uuid/v4");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
// use express.json() to ensure requests are in JSON format. Need this middleware
// express does not parse by default, thus the need for middleware.
app.use(express.json());
app.use(helmet());
app.use(cors());

app.get("/", (req, res) => {
  res.send("GET request received");
});

const users = [
  {
    id: "3c8da4d5-1597-46e7-baa1-e402aed70d80",
    username: "sallyStudent",
    password: "c00d1ng1sc00l",
    favoriteClub: "Cache Valley Stone Society",
    newsLetter: "true"
  },
  {
    id: "ce20079c-2326-4f17-8ac4-f617bfd28b7f",
    username: "johnBlocton",
    password: "veryg00dpassw0rd",
    favoriteClub: "Salt City Curling Club",
    newsLetter: "false"
  }
];
// query parameters to modify a request, but below here, the route paramter usage is for resources.
// For instance, to request details of a book with id 1234 you may request the endpoint GET / book / 1234,
// the 1234 part of the URL identifies the resource that you are interested in. On the other hand,
// to get a list of books sorted by title, you might request GET / books ? sort = title because the sort is used to modify the request,
// rather than identify the resource.
app.get("/book/:bookId", (req, res) => {});

// Since the ID of the item to be deleted is used to identify the resource it is a good use case for a route parameter.
// That is, we would want to define the DELETE endpoint like this:
// deleting is not a simple decision:
// Let's suppose that the site decides to stop selling product X so that information about that product should no longer be displayed on your website.
// Do you delete the entry in your data about product X? What about all the customers that bought product X in the past?

// In your database, you have a set of orders that all list product X as an order item, but you have no information about that product! In real applications,
// we have to be careful about deleting.In many cases, what we think of as deleting
// is simply marking the item with a status of some sort.Say, 'archived' or 'inactive'.The rest of your application will consider this status when interacting with the data.
app.delete("/user/:userId", (req, res) => {
  const { userId } = req.params;
  const index = users.findIndex(u => u.id === userId);

  if (index === -1) {
    return res.status(404).send("User not found");
  }
  users.splice(index, 1);

  //   res.send("Deleted");
  res.status(204).end(); // this is fine. No need for response.
});

app.get("/user", (req, res) => {
  res.json(users);
});

// to test out below post, yhou must go to postman, under body and json/application and make an object with all these values in json
// HTTP request methods can share the same endpoint. ***
app.post("/register", (req, res) => {
  // get the data. newsletter is optional, so false gives it a default value
  const { username, password, favoriteClub, newsLetter = false } = req.body;

  // All are required, check if they were sent
  if (!username) {
    return res.status(400).send("Username required");
  }

  if (!password) {
    return res.status(400).send("Password required");
  }

  if (!favoriteClub) {
    return res.status(400).send("favorite Club required");
  }

  // make sure username is correctly formatted.
  if (username.length < 6 || username.length > 20) {
    return res.status(400).send("Username must be between 6 and 20 characters");
  }

  // password length
  if (password.length < 8 || password.length > 36) {
    return res.status(400).send("Password must be between 8 and 36 characters");
  }

  // password contains digit, using a regex here
  if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
    return res.status(400).send("Password must be contain at least one digit");
  }

  const clubs = [
    "Cache Valley Stone Society",
    "Ogden Curling Club",
    "Park City Curling Club",
    "Salt City Curling Club",
    "Utah Olympic Oval Curling Club"
  ];

  // make sure the club is valid
  if (!clubs.includes(favoriteClub)) {
    return res.status(400).send("Not a valid club");
  }

  const id = uuid();
  const newUser = {
    id,
    username,
    password,
    favoriteClub,
    newsLetter
  };
  users.push(newUser);
  // at this point all validation passed
  // below are the 2 popular ways to respond to sucessful requests
  // both would need /user endpoint to exist.
  //   res.status(204).end();
  // res
  //     .status(201)
  //     .location(`http://localhost:8000/user/${id}`)
  //     .json({ id: id });
  res
    .status(201)
    .location(`http://localhost:8000/user/${id}`)
    .json(newUser);
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
