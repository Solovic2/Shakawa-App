import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
const Logout = () => {
    const [, , removeCookie] = useCookies(['user']);
    const navigate = useNavigate();

    
    const handleLogout = async (event) => {
        event.preventDefault();
        const response = await fetch('/logout');
        if (response.ok) {
            removeCookie('user', { path: '/' });
            
            navigate('/login'); // Redirect to the login page after logging out
        } else {
        console.error('Error logging out:', response.statusText);
        }
    };
    
    return (
        <div className='logout'>
            <button className='btn btn-danger' onClick={handleLogout}>تسجيل الخروج</button>
        </div>
        
    );
    
}

export default Logout