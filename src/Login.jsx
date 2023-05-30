import { useState } from 'react';
import Dashboard from './components/Dashboard';
import { Link, useHistory } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { TextField, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import userPool from './userPool';


const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
      width: '50ch',
    },
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
}));


export function Login() {


  const classes = useStyles();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //log in button set method
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSubmit = () => {
     // TODO: Implement login logic
     const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    });
  
  const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
  });

  user.authenticateUser(authDetails, {
      onSuccess: (data) => {
        console.log('onSuccess:', data);
        alert('Login successful');
        
      },
      onFailure: (err) => {
        console.error('onFailure:', err);
        alert('Login failed');
      },
      newPasswordRequired: (data) => {
        console.log('newPasswordRequired:', data);
      },
    });
    //navigate('/register');
  setIsLoggedIn(true);

  };

  if (isLoggedIn) {
    return <Dashboard isLoggedIn={true}/>;
  }
  

  return (
    <div className={classes.container}>
      <form className={classes.root} noValidate autoComplete="off">
        <TextField
          id="email"
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br/>
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br/>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Login
        </Button>
      </form>
      <div>
        Don't have an account?{' '}
        <Link to="/register">Register here</Link>
      </div>
    </div>


  );
}
