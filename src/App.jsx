import React, { useState } from 'react';
import LoginForm from './User/SIgnIn';
import Profile from './User/Profile';

function App() {
  const [user, setUser] = useState(null);

  return user ? (
    <Profile userInfo={user} onSignOut={() => setUser(null)} />
  ) : (
    <LoginForm onSignInSuccess={setUser} />
  );
}

export default App;