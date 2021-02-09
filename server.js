const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const User = require("./Models/User");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();

//Load env vars
dotenv.config({ path: "./.env" });

//Default port for NODE app
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

app.use(
  "/",
  graphqlHTTP({
    schema: buildSchema(`
        type RootQuery {
          events : [String!]!
        }

        type RootMutation {
          createUser(email: String,password: String): String,
          loginUser(email: String,password: String): String,
          addNewTodo(email: String,name: String,description: String): String,
        }

        schema {
          query: RootQuery
          mutation: RootMutation
        }
    `),
    rootValue: {
      addNewTodo: async ({ email, name, description }) => {
        try {
          let newTodo = { name, description };
          await User.findOneAndUpdate({ email }, { $push: { todos: newTodo } });
          return "New todo added";
        } catch (e) {
          throw new Error(e.message);
        }
      },
      createUser: async ({ email, password }) => {
        try {
          let hashedPassword = await bcrypt.hashSync(password, 10);
          const newUser = new User({
            email,
            password: hashedPassword,
          });
          await newUser.save();
          return "User created";
        } catch (e) {
          throw new Error(e.message);
        }
      },
      loginUser: async ({ email, password }) => {
        try {
          let user = await User.findOne({ email });
          if (user) {
            let passwordMatched = await bcrypt.compareSync(
              password,
              user.password
            );
            if (passwordMatched) {
              console.log("passwordMatched", passwordMatched);
              const token = await jwt.sign({ email }, process.env.JWT_SECRET, {
                expiresIn: "2h",
              });
              console.log("token", token);
              return token;
            } else {
              throw new Error("Invalid email (or) password");
            }
          } else {
            throw new Error("User not found");
          }
        } catch (e) {
          throw new Error(e.message);
        }
      },
    },
    graphiql: true,
  })
);

//Connect to Mongo DB then Start server
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    app.listen(PORT);
    console.log("MongoDB is connected\nGraphQL server running");
  })
  .catch((error) => console.log(`Can't Establish connection with DB`, error));
