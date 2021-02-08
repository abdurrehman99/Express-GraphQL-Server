const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
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
            createEvent(name: String): String 
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return ["Cooking", "Reading"];
      },
      createEvent: (args) => {
        const eventName = args.name;
        return eventName;
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
  })
  .then(() => {
    app.listen(PORT);
    console.log("MongoDB is connected\nGraphQL server running");
  })
  .catch((error) => console.log(`Can't Establish connection with DB`, error));
