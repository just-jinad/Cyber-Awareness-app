import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Define the correct type for page props
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ModuleDetail({ params }: PageProps) {
  // Await params to get the id
  const { id } = await params;
  
  // Await headers() and get host
  const h = await headers();
  const host = h.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  
  // Use the awaited id in the URL
  const apiUrl = `${protocol}://${host}/api/modules/${id}`;
  const res = await fetch(apiUrl, { cache: 'no-store' });
  
  if (!res.ok) return notFound();
  
  const module = await res.json();
  if (!module || !module.id) return notFound();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="rounded-xl shadow-md border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-2">{module.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {module.imageUrl && (
            <img 
              src={module.imageUrl} 
              alt={module.title} 
              className="mb-4 w-full h-64 object-cover rounded-md border" 
            />
          )}
          <div 
            className="prose dark:prose-invert max-w-none text-base leading-relaxed" 
            style={{ whiteSpace: 'pre-line' }}
          >
            {module.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}