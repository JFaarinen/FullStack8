import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ALL_AUTHORS } from '../queries';
import AuthorForm from './AuthorForm';

const Authors = (props) => {
  const [authors, setAuthors] = useState([]);
  const result = useQuery(ALL_AUTHORS);

  useEffect(() => {
    if (result.data) {
        setAuthors(result.data.allAuthors);
    }
  }, [result]);

  if (result.loading) {
    return <div>loading...</div>
  }

  if (!props.show) {
    return null
  }
 
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <AuthorForm authors={result.data.allAuthors}/>
    </div>
  )
}

export default Authors