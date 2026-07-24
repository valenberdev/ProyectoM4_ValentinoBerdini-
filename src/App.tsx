import './App.css'
import { auth, db } from './services/firebase/firebaseConfig';
import { AppRouter } from './routes/AppRouter';

console.log('Auth:', auth);
console.log('Firestore:', db);


function App() {
  return <AppRouter />;
}

export default App;