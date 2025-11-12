"use client";

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Video, MapPin, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface CCTVFootage {
  id: number;
  reportId: number | null;
  location: string;
  footageDate: string;
  footageTime: string | null;
  description: string | null;
  videoUrl: string | null;
  status: string;
  createdAt: string;
}

interface Report {
  id: number;
  fullName: string;
  lastSeenLocation: string;
  status: string;
}

export default function CCTVFootagePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<CCTVFootage[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [formData, setFormData] = useState({
    location: '',
    footageDate: '',
    footageTime: '',
    reportId: 'none',
    description: '',
    videoUrl: '',
    contactInfo: '',
  });

  useEffect(() => {
    fetchReports();
    fetchSubmissions();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports?limit=100&status=active');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/cctv-footage?limit=20');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/cctv-footage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: formData.location,
          footageDate: formData.footageDate,
          footageTime: formData.footageTime || null,
          reportId: formData.reportId && formData.reportId !== 'none' ? parseInt(formData.reportId) : null,
          submittedByUserId: user?.id || null,
          description: formData.description || null,
          videoUrl: formData.videoUrl || null,
          contactInfo: formData.contactInfo || null,
          status: 'pending',
        }),
      });

      if (response.ok) {
        toast.success('CCTV footage information submitted successfully!');
        setFormData({
          location: '',
          footageDate: '',
          footageTime: '',
          reportId: 'none',
          description: '',
          videoUrl: '',
          contactInfo: '',
        });
        fetchSubmissions();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit footage information');
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      toast.error('An error occurred while submitting');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
    matched: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Video className="h-8 w-8 text-primary" />
            CCTV Footage Surveillance
          </h1>
          <p className="text-muted-foreground">
            Submit information about CCTV footage that may help locate missing persons
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submission Form */}
          <Card>
            <CardHeader>
              <CardTitle>Submit CCTV Footage Information</CardTitle>
              <CardDescription>
                Help us by providing details about available CCTV footage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Alert>
                  <AlertDescription className="text-sm">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    Your submission helps authorities analyze surveillance footage to locate missing persons.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Camera Location *
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Main Street & 5th Ave, Store entrance"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, location: e.target.value }))
                    }
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="footageDate" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date *
                    </Label>
                    <Input
                      id="footageDate"
                      type="date"
                      value={formData.footageDate}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, footageDate: e.target.value }))
                      }
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footageTime" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time
                    </Label>
                    <Input
                      id="footageTime"
                      type="time"
                      value={formData.footageTime}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, footageTime: e.target.value }))
                      }
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportId">Related Missing Person (Optional)</Label>
                  <Select
                    value={formData.reportId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, reportId: value }))
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a missing person report" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None - General submission</SelectItem>
                      {reports.map((report) => (
                        <SelectItem key={report.id} value={report.id.toString()}>
                          {report.fullName} - {report.lastSeenLocation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what can be seen in the footage, camera coverage area, etc."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    rows={4}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video/Footage URL</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder="https://example.com/footage.mp4 (optional)"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))
                    }
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactInfo">Contact Information</Label>
                  <Input
                    id="contactInfo"
                    placeholder="Phone or email for authorities to reach you"
                    value={formData.contactInfo}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, contactInfo: e.target.value }))
                    }
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Footage Information'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>CCTV footage reports from the community</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSubmissions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No submissions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {submissions.map((footage) => (
                      <Card key={footage.id} className="border-2">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <p className="font-semibold">{footage.location}</p>
                            </div>
                            <Badge
                              className={
                                statusColors[footage.status as keyof typeof statusColors] ||
                                statusColors.pending
                              }
                            >
                              {footage.status}
                            </Badge>
                          </div>

                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(footage.footageDate)}</span>
                              {footage.footageTime && (
                                <>
                                  <Clock className="h-3 w-3 ml-2" />
                                  <span>{footage.footageTime}</span>
                                </>
                              )}
                            </div>

                            {footage.description && (
                              <p className="text-xs mt-2">{footage.description}</p>
                            )}

                            {footage.status === 'matched' && (
                              <div className="flex items-center gap-2 mt-2 text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-xs font-medium">Matched to report</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}