"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ReportCard from '@/components/ReportCard';
import ReportSightingDialog from '@/components/ReportSightingDialog';
import SightingsList from '@/components/SightingsList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Filter, MapPin, Calendar, User, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Report {
  id: number;
  fullName: string;
  age?: number | null;
  gender?: string | null;
  height?: string | null;
  weight?: string | null;
  hairColor?: string | null;
  eyeColor?: string | null;
  complexion?: string | null;
  distinguishingMarks?: string | null;
  lastSeenLocation: string;
  lastSeenDate: string;
  status: string;
  imageUrl?: string | null;
  description?: string | null;
  contactInfo?: string | null;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [sightingDialogOpen, setSightingDialogOpen] = useState(false);
  const [showSightings, setShowSightings] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    gender: '',
  });

  useEffect(() => {
    // Read search query from URL on mount
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setFilters((prev) => ({ ...prev, search: urlQuery }));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, reports]);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports?limit=100');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
        setFilteredReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.fullName.toLowerCase().includes(searchLower) ||
          r.lastSeenLocation.toLowerCase().includes(searchLower) ||
          r.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    if (filters.gender && filters.gender !== 'all') {
      filtered = filtered.filter((r) => r.gender === filters.gender);
    }

    setFilteredReports(filtered);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const statusColors = {
    active: 'bg-red-100 text-red-800 border-red-200',
    found: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Missing Persons</h1>
          <p className="text-muted-foreground">
            Browse and filter through reported missing persons cases
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <Input
                  placeholder="Name or location..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="found">Found</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={filters.gender}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setFilters({ search: '', status: '', gender: '' })}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {filteredReports.length} of {reports.length} reports
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredReports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onClick={() => setSelectedReport(report)}
                    />
                  ))}
                </div>
                {filteredReports.length === 0 && (
                  <Card className="p-12">
                    <div className="text-center text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No reports found matching your filters</p>
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Missing Person Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  {selectedReport.imageUrl ? (
                    <img
                      src={selectedReport.imageUrl}
                      alt={selectedReport.fullName}
                      className="h-32 w-32 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-lg bg-muted flex items-center justify-center">
                      <User className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{selectedReport.fullName}</h3>
                    <Badge
                      className={`mt-2 ${
                        statusColors[
                          selectedReport.status as keyof typeof statusColors
                        ] || statusColors.active
                      }`}
                    >
                      {selectedReport.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Physical Description</h4>
                    <div className="space-y-1 text-sm">
                      {selectedReport.age && (
                        <p>
                          <span className="text-muted-foreground">Age:</span>{' '}
                          {selectedReport.age} years
                        </p>
                      )}
                      {selectedReport.gender && (
                        <p>
                          <span className="text-muted-foreground">Gender:</span>{' '}
                          {selectedReport.gender.charAt(0).toUpperCase() +
                            selectedReport.gender.slice(1)}
                        </p>
                      )}
                      {selectedReport.height && (
                        <p>
                          <span className="text-muted-foreground">Height:</span>{' '}
                          {selectedReport.height}
                        </p>
                      )}
                      {selectedReport.weight && (
                        <p>
                          <span className="text-muted-foreground">Weight:</span>{' '}
                          {selectedReport.weight}
                        </p>
                      )}
                      {selectedReport.hairColor && (
                        <p>
                          <span className="text-muted-foreground">Hair:</span>{' '}
                          {selectedReport.hairColor}
                        </p>
                      )}
                      {selectedReport.eyeColor && (
                        <p>
                          <span className="text-muted-foreground">Eyes:</span>{' '}
                          {selectedReport.eyeColor}
                        </p>
                      )}
                      {selectedReport.complexion && (
                        <p>
                          <span className="text-muted-foreground">Complexion:</span>{' '}
                          {selectedReport.complexion}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Last Known Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-xs">Location</p>
                          <p>{selectedReport.lastSeenLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-xs">Date</p>
                          <p>{formatDate(selectedReport.lastSeenDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedReport.distinguishingMarks && (
                  <div>
                    <h4 className="font-semibold mb-2">Distinguishing Marks</h4>
                    <p className="text-sm">{selectedReport.distinguishingMarks}</p>
                  </div>
                )}

                {selectedReport.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm">{selectedReport.description}</p>
                  </div>
                )}

                {selectedReport.contactInfo && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contact Information
                    </h4>
                    <p className="text-sm">{selectedReport.contactInfo}</p>
                  </div>
                )}

                {/* Sightings Section */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Reported Sightings
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSightings(!showSightings)}
                    >
                      {showSightings ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  {showSightings && <SightingsList reportId={selectedReport.id} />}
                </div>

                {/* Add Report Sighting Button */}
                {selectedReport.status === 'active' && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => {
                        setSightingDialogOpen(true);
                      }}
                      className="w-full"
                      size="lg"
                    >
                      <User className="mr-2 h-5 w-5" />
                      Report a Sighting
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Have you seen this person? Help reunite them with their family.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Sighting Dialog */}
      {selectedReport && (
        <ReportSightingDialog
          open={sightingDialogOpen}
          onOpenChange={setSightingDialogOpen}
          reportId={selectedReport.id}
          personName={selectedReport.fullName}
          onSuccess={() => {
            setShowSightings(true);
          }}
        />
      )}
    </div>
  );
}