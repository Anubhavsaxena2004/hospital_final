import React, { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

interface Props {
  onFlip: () => void;
}

const LoginForm: React.FC<Props> = ({ onFlip }) => {
  // Use the loginUser function from our context
  const { loginUser } = useContext(AuthContext)!;

  return (
    <div className="form-container">
      <h2>Login</h2>
      {/* The onSubmit handler is now our loginUser function */}
      <form onSubmit={loginUser}>
        {/* Use 'username' instead of 'email' */}
       <input type="text" name="username" placeholder="Username" required />
<input type="password" name="password" placeholder="Password" required />
<input type="text" name="hospital_id" placeholder="Hospital ID" required />

        <button type="submit">Login</button>
      </form>
      <p>
        Don’t have an account? <span onClick={onFlip} style={{cursor: 'pointer', color: 'blue'}}>Register</span>
      </p>
    </div>
  );
};

export default LoginForm;