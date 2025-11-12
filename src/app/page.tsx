"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import ReportCard from '@/components/ReportCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, FileText, Users, AlertCircle, ArrowRight } from 'lucide-react';

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

export default function Home() {
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRecentReports();
  }, []);

  const fetchRecentReports = async () => {
    try {
      const response = await fetch('/api/reports?limit=6&status=active');
      if (response.ok) {
        const data = await response.json();
        setRecentReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    } else {
      window.location.href = '/search';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Help Bring Loved Ones Home
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              A community-driven platform to report and search for missing persons
            </p>
            
            <div className="flex gap-2 max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-white text-gray-900 text-lg h-14"
              />
              <Button
                size="lg"
                onClick={handleSearch}
                className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-8"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-50 to-transparent"></div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            Three simple steps to help find missing persons
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6 text-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Report</h3>
              <p className="text-muted-foreground">
                Submit detailed information about the missing person including photos and last known location
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6 text-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Search</h3>
              <p className="text-muted-foreground">
                Browse through reports and use filters to search by location, physical features, and more
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="pt-6 text-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Connect</h3>
              <p className="text-muted-foreground">
                Contact information is provided for each report to facilitate community involvement
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Reports Section */}
      <section className="container mx-auto px-4 py-16 bg-white/50 rounded-lg">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Recent Active Cases</h2>
            <p className="text-muted-foreground">
              Help us find these missing persons
            </p>
          </div>
          <Link href="/search">
            <Button variant="outline" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active cases at the moment</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={() => (window.location.href = '/search')}
              />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Have Information About a Missing Person?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Every piece of information helps. Report now and make a difference.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/report">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <FileText className="mr-2 h-5 w-5" />
                  Report Missing Person
                </Button>
              </Link>
              <Link href="/search">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-white/10"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search Database
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">
              <strong className="text-primary">KhojAI</strong> - Helping reunite families
            </p>
            <p className="text-sm">
              For emergencies, please contact your local authorities immediately.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}