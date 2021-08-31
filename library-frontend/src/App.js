import React, { useEffect, useState } from 'react';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import LoginForm from './components/LoginForm';
import Recommended from './components/Recommended';
import { useApolloClient, useSubscription } from '@apollo/client';
import { ALL_BOOKS, BOOK_ADDED } from './queries';

const App = () => {
  const [token, setToken] = useState(null);
  const [page, setPage] = useState('authors');
  const client = useApolloClient();

  useEffect(() => {
    const loggedToken = window.localStorage.getItem('library-user-token');
    if (loggedToken) {
      setToken(loggedToken);
    }
  }, []); // eslint-disable-line

  const handleLoginClick = () => {
    if (token) {
      console.log('logging out...');
      setToken(null);
      localStorage.clear();
      client.resetStore();
    } else {
      setPage('login');     
    }
  }

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) => set.map(b => b.id).includes(object.id);
    const booksInStore = client.readQuery({ query: ALL_BOOKS });
    if(!includedIn(booksInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS, 
        data: { allBooks: booksInStore.allBooks.concat(addedBook)}
      })
    }
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subScriptionData }) => {
      const addedBook = subScriptionData.data.bookAdded;
      window.alert(`${addedBook.title} added to library`);
      updateCacheWith(addedBook)
    }
  })

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token !== null && <button onClick={() => setPage('add')}>add book</button> }
        {token !== null && <button onClick={() => setPage('recommended')}>recommended</button>}
        <button onClick={() => handleLoginClick()}>{token===null ? 'Login' : 'Logout'}</button>
      </div>

      <Authors
        show={page === 'authors'}
      />

      <Books
        show={page === 'books'}
      />

      <NewBook
        show={page === 'add'}
        updateCacheWith={updateCacheWith}
      />

      <LoginForm 
          show={page === 'login'}
          setToken={setToken}
          setPage={setPage}
      />

      <Recommended 
      show={page === 'recommended'}
      />

    </div>
  )
}

export default App