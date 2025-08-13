import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold">StayQuest</Link>

      <div className="space-x-4 flex items-center">
        <Link href="/">Home</Link>

        {user && (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/favorites">Favorites</Link>
            <button
              onClick={async () => {
                try {
                  await logout();
                  window.location.href = '/'; // redirect to home
                } catch (err) {
                  console.error('Logout failed:', err);
                }
              }}
              className="bg-red-500 px-4 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}

        {!user && (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}
