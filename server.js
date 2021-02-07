const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

const app = express();

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

app.listen(5000, () => console.log("GraphQL server running"));
