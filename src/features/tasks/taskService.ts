import {
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { type Task } from '../../types/task';
import { doc, deleteDoc } from 'firebase/firestore';

export function convertirDocumentoATask(id: string, data: DocumentData): Task {
  return {
    id,
    userId: data.userId,
    title: data.title,
    description: data.description,
    completed: data.completed,
    priority: data.priority,
    order: data.order,
    dueDate: data.dueDate ? data.dueDate.toDate() : null,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

interface NuevaTareaInput {
  title: string;
  description: string;
  priority: Task['priority'];
  dueDate: Date | null;
}

export async function createTask(
  userId: string,
  input: NuevaTareaInput,
  order: number
) {
  await addDoc(collection(db, 'tasks'), {
    userId,
    title: input.title,
    description: input.description,
    priority: input.priority,
    dueDate: input.dueDate,
    completed: false,
    order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTask(taskId: string) {
    await deleteDoc(doc(db, 'tasks', taskId));
}

export async function updateTask(
  taskId: string,
  updatedFields: Partial<Omit<Task, 'id' | 'userId'>>
) {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    ...updatedFields,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleTaskCompletion(taskId: string, completed: boolean) {
  await updateTask(taskId, { completed });
}