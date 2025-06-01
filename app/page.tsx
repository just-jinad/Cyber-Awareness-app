import Link from 'next/link';

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Welcome to Cybersecurity Awareness Platform</h1>
      <p>
        Navigate to <Link href="/auth/signin" className="text-blue-500">Sign In</Link> to get started, or view our{' '}
        <Link href="/modules" className="text-blue-500">Training Modules</Link>.
      </p>
    </div>
  );
}