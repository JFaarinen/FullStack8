import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { LOGIN } from "../queries";

const LoginForm = ({show, setToken, setPage}) => {
    const [username, setUsername] = useState('');
    const [password, setPasswod] = useState('');
    const [login, result] = useMutation(LOGIN, {
        onError: (error) => {
            console.log(error.graphQLErrors[0].message);
        }
    });

    useEffect(() => {
        if (result.data) {
            const token = result.data.login.value;
            setToken(token);
            localStorage.setItem('library-user-token', token);
        }
    }, [result.data]) // eslint-disable-line

    const submit = (event) => {
        event.preventDefault();
        console.log('logging in...');
        login({ variables: {username, password}});
        setUsername('');
        setPasswod('');
        setPage('authors');
    }
    
    if (!show) {
        return null
    }

    return(
        <form onSubmit={submit}>
            <div>
                username: <input 
                type='text'
                value={username}
                onChange={({target}) => setUsername(target.value)}
                />
            </div>
            <div>
                password: <input 
                type='password'
                value={password}
                onChange={({target}) => setPasswod(target.value)}
                />
            </div>
            <button type='submit'>login</button>
        </form>
    )

}

export default LoginForm;