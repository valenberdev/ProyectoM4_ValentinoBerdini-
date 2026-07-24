import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  type AuthError,
} from 'firebase/auth';
import { auth } from '../../services/firebase/firebaseConfig';

function traducirErrorAuth(error: AuthError): string {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'El correo electrónico ya está en uso. Por favor, utiliza otro correo.';
    case 'auth/invalid-email':
      return 'El correo electrónico no es válido.';
    case 'auth/weak-password':
      return 'La contraseña es insegura. Por favor, utiliza una contraseña más segura.';
    case 'auth/invalid-credential':
      return 'Las credenciales son inválidas. Por favor, inténtalo de nuevo.';
    case 'auth/too-many-requests':
      return 'Se han realizado demasiadas solicitudes. Por favor, inténtalo de nuevo más tarde.';
    default:
      return 'Ocurrió un error desconocido. Por favor, inténtalo de nuevo más tarde.';
  }
}

export async function registrarUsuario(email: string, password: string) {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error) {
    throw new Error(traducirErrorAuth(error as AuthError));
  }
}

export async function iniciarSesion(email: string, password: string) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error) {
    throw new Error(traducirErrorAuth(error as AuthError));
  }
}

export async function iniciarSesionConGoogle() {
  try {
    const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
    return user;
  } catch (error) {
    throw new Error(traducirErrorAuth(error as AuthError));
  }
}

export async function cerrarSesion() {
  await signOut(auth);
}