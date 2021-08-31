const { ApolloServer, gql, UserInputError, AuthenticationError, PubSub } = require('apollo-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Book = require('./models/book');
const Author = require('./models/author');
const User = require('./models/user');
require('dotenv').config();

const pubsub = new PubSub();

const JWT_SECRET = 'SALAINEN_AVAIN';
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true})
.then(() => {
    console.log('connected to MongoDB');
})
.catch((error) => {
    console.log('error connecting to MongoDB: ', error.name);
});


const typeDefs = gql`

    type Subscription {
        bookAdded: Book!
    }

    type Query {
        authorCount: Int! 
        bookCount: Int!
        allAuthors: [Author]!
        allBooks(author: String, genre: String): [Book]!
        me: User
    }

    type Mutation {
        addBook(
            title: String!
            published: Int!
            author: String!
            genres: [String]
        ): Book

        editAuthor(
            name: String!, 
            born: Int!
        ) : Author

        createUser( 
            username: String! 
            favouriteGenre: String!
        ): User 

        login( 
            username: String! 
            password: String! 
        ): Token
    }

    type Author {
        name: String!
        bookCount: Int
        born: Int
    }

    type Book {
        title: String!
        author: Author!
        published: Int!
        genres: [String]
        id: ID!
    }

    type User {
        username: String! 
        favouriteGenre: String! 
        id: ID!
    }
    type Token {
        value: String!
    }
`

const resolvers = {
    Query: {
        authorCount: () => Author.collection.countDocuments(),
        bookCount: () => Book.collection.countDocuments(),
        allAuthors: () => Author.find({}),
        allBooks: async (root, args) => {
            console.log(root);
            console.log(args);
            if (args.author && args.genre){
                const authId = await Author.find({name: args.author});
                return Book.find({author: authId, genres: {$in: [args.genre]}}).populate('author');  
            }
            if (args.author){
                const authId = await Author.find({name: args.author});
                return Book.find({author: authId}).populate('author');  
            }
            if (args.genre){
                return Book.find({genres: {$in: [args.genre]}}).populate('author');
            }
           return Book.find({}).populate('author');
        },
        me: (root, args, context) => {
            return context.currentUser;
        }
    },
    Mutation: {
        addBook: async (root, args, context) => {
            console.log(context);
            const currentUser = context.currentUser;
            if (!currentUser) {
                throw new AuthenticationError("not authenticated!");
            }

            let author = await Author.findOne({name: args.author});
            if (!author) {
                author = new Author({ name: args.author});
                try {
                    await author.save();
                } catch (error) {
                    throw new UserInputError('invalid author name', {
                        invalidArgs: args
                    });
                }
            }
            const book = new Book({...args, author: author});
            try {
                await book.save();
            } catch (error) {
                throw new UserInputError('invalid book information', error.message, {
                    invalidArgs: args
                });
            };

            pubsub.publish('BOOK_ADDED', { bookAdded: book });
            return book;
        },

        editAuthor: async (root, args, context) => {
            const currentUser = context.currentUser;
            if (!currentUser) {
                throw new AuthenticationError("not authenticated!");
            }
            
            const author = await Author.findOne({name: args.name});
            if (!author) {
                return null
            }
            author.born = args.born;
            return author.save();               
        },

        createUser: (root, args) => {
            const user = new User({ username: args.username, favouriteGenre: args.favouriteGenre});

            return user.save() 
            .catch(error => {
                throw new UserInputError(error.message, {
                    invalidArgs: args
                });
            });
        },

        login: async (root, args) => {
            const user = await User.findOne({ username: args.username });

            if (!user || args.password !== 'kalainen') {
                throw new UserInputError('wrong credentials!');
            }

            const userForToken = {
                username: user.username,
                id: user._id
            }
            return { value: jwt.sign(userForToken, JWT_SECRET)}
        }
    },

    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator(['PERSON_ADDED'])
        }
    },

    Author: {
        bookCount: async (root) => {
            return Book.collection.countDocuments({author: root._id});
        }
    }
}

const server = new ApolloServer({
    typeDefs, 
    resolvers, 
    context: async ({ req }) => {
        const auth = req ? req.headers.authorization: null; 
        if (auth && auth.toLowerCase().startsWith('bearer ')) {
            const decodedToken = jwt.verify(
                auth.substring(7), JWT_SECRET
            );
            const currentUser = await User
            .findById(decodedToken.id);
            return { currentUser }
        } else {
            return null
        }
    }
});

server.listen().then(({url, subscriptionsUrl}) => {
    console.log(`Server ready at ${url}`);
    console.log(`Subscriptions ready at ${subscriptionsUrl}`);
});