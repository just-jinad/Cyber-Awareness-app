"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Quiz {
  id: number;
  title: string;
  type: string;
}

export default function DashboardQuizzesPage() {
  const { data: session, status } = useSession();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; quizId: number | null }>({ open: false, quizId: null });

  useEffect(() => {
    const fetchQuizzes = async () => {
      const res = await fetch("/api/quizzes");
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      }
    };
    if (status === "authenticated") fetchQuizzes();
  }, [status]);

  const handleDelete = async (quizId: number) => {
    const res = await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
    if (res.ok) {
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    }
    setDeleteDialog({ open: false, quizId: null });
  };

  if (status === "loading") return <div className="container mx-auto p-6">Loading...</div>;
  if (!session) return <div className="container mx-auto p-6">Please sign in to view quizzes.</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">All Quizzes</h1>
        <Link href="/dashboard/quizzes/create">
          <Button variant="outline">Create Quiz</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id}>
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-xs text-muted-foreground">Type: {quiz.type}</div>
              <div className="flex gap-2">
                <Link href={`/dashboard/quizzes/edit/${quiz.id}`}>
                  <Button size="sm" variant="outline">Edit</Button>
                </Link>
                <Button size="sm" variant="destructive" onClick={() => setDeleteDialog({ open: true, quizId: quiz.id })}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={deleteDialog.open} onOpenChange={open => setDeleteDialog(d => ({ ...d, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this quiz? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, quizId: null })}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteDialog.quizId!)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
