import { useMutation } from '@apollo/client';
import React, { useState } from 'react';
import Select from 'react-select';
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries';

const AuthorForm = ({authors}) => {
    const [born, setBorn] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState(null);

    const options = authors.map(a => ({
        value: a.name,
        label: a.name
    }));

    const [ editAuthor ] = useMutation(EDIT_AUTHOR, {
        refetchQueries: [{query: ALL_AUTHORS}]
    });

    const updateAuthor = (event) => {
        event.preventDefault();
        editAuthor({variables: {name: selectedAuthor.value, born: parseInt(born)}});
        setSelectedAuthor(null)
        setBorn('');
    }
    return (
        <form onSubmit={updateAuthor}>
            <h2>Set birthyear</h2>
            <div>
                name <Select 
                    defaultValue={selectedAuthor}
                    onChange={setSelectedAuthor}
                    options={options} 
                />
            </div>
            <div>
                <div>
                    born
                </div>
                <div>
                    <input type='number'  value={born} onChange={({target}) => setBorn(target.value)} />
                </div>
            </div>
            <button type='submit'>update author</button>
        </form>
    )
}
export default AuthorForm;