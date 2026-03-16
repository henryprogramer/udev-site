import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
}