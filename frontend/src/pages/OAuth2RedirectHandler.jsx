import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error(decodeURIComponent(error));
      navigate('/login', { replace: true });
      return;
    }

    if (token) {
      login(token);
      try {
        const decoded = jwtDecode(token);
        const rawRole = decoded.role || (decoded.roles && decoded.roles[0]) || 'ROLE_USER';
        const role = rawRole.replace('ROLE_', '');
        toast.success('Signed in with Google!');
        if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
        else if (role === 'TECHNICIAN') navigate('/tech/dashboard', { replace: true });
        else navigate('/user/dashboard', { replace: true });
      } catch {
        toast.error('Authentication error. Please try again.');
        navigate('/login', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-gray-800">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">Completing sign-in…</p>
      </div>
    </div>
  );
}
