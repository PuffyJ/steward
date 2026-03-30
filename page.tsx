import { redirect } from 'next/navigation';

// For now, redirect to the demo org
// When auth is added, this will check the user's org membership
export default function Home() {
  redirect('/imtglobal/dashboard');
}
