'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

export default function SectionItem() {
  const { section, id } = useParams<{ section: string; id: string }>();
  const { data: session, status } = useSession();
  const [item, setItem] = useState<{ title: string; content?: string } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.id) return;

    const fetchItem = async () => {
      try {
        let res;
        if (section === 'simulations') {
          res = await fetch(`/api/simulations/${id}`);
        } else if (section === 'quizzes') {
          res = await fetch(`/api/quizzes/${id}`);
        } else if (section === 'modules') {
          res = await fetch(`/api/modules/${id}`);
        }
        if (res?.ok) {
          const data = await res.json();
          setItem({ title: data.title, content: data.content || data.steps });
        }
      } catch (error) {
        console.error(`Error fetching ${section} item ${id}:`, error);
      }
    };
    fetchItem();
  }, [section, id, session?.user?.id, status]);

  if (status === 'loading') {
    return <div className="text-white">Loading...</div>;
  }

  if (!session?.user) {
    return <div className="text-white">Please log in to view this item.</div>;
  }

  if (!item) return <div className="text-white">Item not found.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{item.title}</h1>
      <Card className="bg-gray-800 border-gray-700">
        <CardContent>
          <p className="text-sm text-gray-300">{item.content || 'No content available.'}</p>
          {/* Add completion button or logic here later */}
        </CardContent>
      </Card>
    </div>
  );
}