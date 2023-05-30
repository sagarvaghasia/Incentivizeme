import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
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

const Registration = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    // TODO: Implement registration logic
    userPool.signUp(email, password, [], null, (err, data) => {
        if (err) {
          console.error(err);
          alert("Error occurred while registering the user");
        }
        console.log(data);
        alert("User registered successfully");
        navigate("/");
      });
  };

  return (
    <div className={classes.container}>
      <form className={classes.root} noValidate autoComplete="off">
        <TextField
          id="name"
          label="Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br/>
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
        <Button variant="contained" color="primary" onClick={handleRegister}>
          Register
        </Button>
      </form>
      <div>
        Already have an account?{' '}
        <Link to="/">Login here</Link>
      </div>
    </div>
  );
};

export default Registration;
