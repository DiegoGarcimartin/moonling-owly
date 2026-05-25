import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'
import { StoredNight } from '../storage'

export async function loadAllNights(userId: string): Promise<StoredNight[]> {
  const snap = await getDocs(collection(db, 'users', userId, 'nights'))
  return snap.docs
    .map(d => d.data() as StoredNight & { updatedAt?: string })
    .map(({ date, sleeps, events }) => ({ date, sleeps, events }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export async function syncNight(night: StoredNight, userId: string): Promise<void> {
  try {
    await setDoc(doc(db, 'users', userId, 'nights', night.date), {
      date: night.date,
      sleeps: night.sleeps,
      events: night.events,
      updatedAt: new Date().toISOString(),
    })
  } catch (e) {
    console.error('syncNight failed (offline?):', e)
  }
}

export async function deleteAllNights(userId: string): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'nights'))
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
  } catch (e) {
    console.error('deleteAllNights failed:', e)
  }
}

export function mergeNights(remote: StoredNight[], local: StoredNight[]): StoredNight[] {
  const byDate = new Map<string, StoredNight>()
  for (const n of local) byDate.set(n.date, n)
  for (const n of remote) byDate.set(n.date, n) // remoto gana en conflicto
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}
