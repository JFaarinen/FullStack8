
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from '../queries';

const Books = (props) => {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filter, setFilter] = useState(null);
  const result = useQuery(ALL_BOOKS);

  useEffect(() => {
    if (result.data) {
        setBooks(result.data.allBooks);
    }
  }, [result]);

  useEffect(() => {
    const genreList = [...new Set(books.flatMap(b => b.genres))];
    setGenres(genreList);
  }, [books, result]) // eslint-disable-line

  const filterBooks = () => {
    if (filter !== null) {
      return books.filter(b => b.genres.includes(filter));
    }
    return books;
  }

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>books</h2>

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
          {filterBooks().map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      {genres.map(genre => 
          <button 
          key={genre}
          onClick={() => setFilter(genre)}
          >{genre}</button>)}
          <button onClick={() => setFilter(null)}>all genres</button>
    </div>
  )
}

export default Books