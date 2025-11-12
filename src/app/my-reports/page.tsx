"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import ReportCard from '@/components/ReportCard';
import { Loader2, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Report {
  id: number;
  fullName: string;
  age?: number | null;
  gender?: string | null;
  lastSeenLocation: string;
  lastSeenDate: string;
  status: string;
  imageUrl?: string | null;
  description?: string | null;
}

export default function MyReportsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchMyReports();
  }, [user]);

  const fetchMyReports = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/reports?reportedBy=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Reports</h1>
          <p className="text-muted-foreground">
            View and manage the missing person reports you've submitted
          </p>
        </div>

        {reports.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>You haven't submitted any reports yet</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={() => router.push('/search')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
