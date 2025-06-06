'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, X, Eye, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Module {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
}

export default function EditModule() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [module, setModule] = useState<Module | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fetchModule = async () => {
      try {
        const res = await fetch(`/api/modules/${id}`);
        if (!res.ok) throw new Error('Failed to fetch module');
        const text = await res.text();
        if (!text) throw new Error('Module not found');
        const data: Module = JSON.parse(text);
        setModule(data);
        // Set initial preview to existing image if available
        if (data.imageUrl) {
          setPreview(data.imageUrl);
        }
      } catch (err) {
        toast.error('Failed to load module');
        setModule(null);
      } finally {
        timer = setTimeout(() => setLoading(false), 6000);
      }
    };
    fetchModule();
    return () => clearTimeout(timer);
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewImage(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Reset to original image if available, otherwise null
      setPreview(module?.imageUrl || null);
    }
  };

  const removeImage = () => {
    setNewImage(null);
    setPreview(null);
    // Reset the file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleEditModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!module) return;

    if (!module.title.trim() || !module.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUpdating(true);

    try {
      const formData = new FormData();
      formData.append('title', module.title.trim());
      formData.append('content', module.content.trim());
      
      if (newImage) {
        formData.append('image', newImage);
      } else if (!preview) {
        // If preview is null and no new image, user wants to remove the image
        formData.append('removeImage', 'true');
      }

      const res = await fetch(`/api/modules/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (res.ok) {
        toast.success('Module updated successfully!');
        router.push('/dashboard/modules');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to update module');
      }
    } catch (error) {
      toast.error('An error occurred while updating the module');
    } finally {
      setUpdating(false);
    }
  };

  // Show spinner for at least 6 seconds or while loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-cyan-500 mb-4" size={48} />
        <span className="text-lg font-medium text-gray-300">Loading module...</span>
      </div>
    );
  }

  if (module === null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/modules">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Modules
            </Button>
          </Link>
        </div>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <p className="text-red-400 text-lg">Module not found or failed to load.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/modules">
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Modules
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Module</h1>
          <p className="text-gray-400 mt-1">Update your educational content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Save className="h-5 w-5 mr-2" />
                Module Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditModule} className="space-y-6">
                {/* Title Field */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Module Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                    value={module.title}
                    onChange={e => setModule({ ...module, title: e.target.value })}
                    required
                    placeholder="Enter a descriptive title for your module"
                    maxLength={100}
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {module.title.length}/100 characters
                  </div>
                </div>

                {/* Content Field */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                    Module Content <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="content"
                    rows={12}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors resize-vertical"
                    value={module.content}
                    onChange={e => setModule({ ...module, content: e.target.value })}
                    required
                    placeholder="Enter the main content of your module. You can include detailed explanations, instructions, or any educational material..."
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {module.content.length} characters
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Module Image <span className="text-gray-500">(optional)</span>
                  </label>
                  
                  {!preview ? (
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                      <input
                        id="image"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label htmlFor="image" className="cursor-pointer">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-300 mb-2">Click to upload an image</p>
                        <p className="text-sm text-gray-500">PNG, JPG, JPEG, WEBP up to 10MB</p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-600"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <input
                        id="image"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => document.getElementById('image')?.click()}
                        className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <Button
                    type="submit"
                    disabled={updating || !module.title.trim() || !module.content.trim()}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating Module...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Module
                      </>
                    )}
                  </Button>
                  <Link href="/dashboard/modules">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      disabled={updating}
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-800 border-gray-700 sticky top-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Preview Image */}
                <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Preview Title */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {module.title || 'Module Title'}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-6">
                    {module.content || 'Module content will appear here as you type...'}
                  </p>
                </div>

                {/* Module Stats */}
                <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Title length:</span>
                    <span className="text-white">{module.title.length} chars</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Content length:</span>
                    <span className="text-white">{module.content.length} chars</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Has image:</span>
                    <span className="text-white">{preview ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-cyan-400">Editing</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}