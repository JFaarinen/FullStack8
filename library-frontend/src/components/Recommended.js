import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ALL_BOOKS, LOGGED_USER } from '../queries';

const Recommended = (props) => {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const userResult = useQuery(LOGGED_USER);
  const bookResult = useQuery(ALL_BOOKS);

  useEffect(() => {
    if (userResult.data) {
        setUser(userResult.data.me);
    }
    if (bookResult.data) {
      setBooks(bookResult.data.allBooks.filter(b => b.genres.includes(user.favouriteGenre)));
    }
  }, [userResult, bookResult]); // eslint-disable-line

  if (!props.show) {
    return null
  }

  if (userResult.loading || books.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>recommendations</h2>
      books in your favourite genre <b>{user.favouriteGenre}</b>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(b =>
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommended;