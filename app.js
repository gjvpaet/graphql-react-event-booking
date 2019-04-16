const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { buildSchema } = require('graphql');
const graphQlHttp = require('express-graphql');

const Event = require('./models/event');

const app = express();

const events = [];

app.use(bodyParser.json());

app.use('/graphql', graphQlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return events;
        },
        createEvent: args => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: args.eventInput.price,
                date: new Date(args.eventInput.date)
            });

            return event.save().then(result => {
                console.log('result: ', result);
                return { ...result._doc };
            }).catch(err => {
                console.log('err: ', err);
                throw err;
            });
        }
    },
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@learning-onu14.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`, { useNewUrlParser: true })
    .then(() => app.listen(8000))
    .catch(err => console.log('err: ', err));