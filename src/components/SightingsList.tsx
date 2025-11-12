"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Calendar, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Sighting {
  id: number;
  reportId: number;
  sightingLocation: string;
  sightingDate: string;
  description: string | null;
  contactInfo: string | null;
  imageUrl: string | null;
  verified: boolean;
  createdAt: string;
}

interface SightingsListProps {
  reportId: number;
}

export default function SightingsList({ reportId }: SightingsListProps) {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSightings();
  }, [reportId]);

  const fetchSightings = async () => {
    try {
      const response = await fetch(`/api/sightings?reportId=${reportId}`);
      if (response.ok) {
        const data = await response.json();
        setSightings(data);
      }
    } catch (error) {
      console.error('Failed to fetch sightings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (sightings.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No sightings reported yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sightings.map((sighting) => (
        <Card key={sighting.id} className="border-l-4" style={{ borderLeftColor: sighting.verified ? '#22c55e' : '#94a3b8' }}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="font-semibold text-sm">{sighting.sightingLocation}</p>
              </div>
              {sighting.verified && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Calendar className="h-3 w-3" />
              <span>{formatDateTime(sighting.sightingDate)}</span>
            </div>

            {sighting.description && (
              <p className="text-sm mt-2 text-muted-foreground">{sighting.description}</p>
            )}

            {sighting.imageUrl && (
              <div className="mt-2">
                <a 
                  href={sighting.imageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <ImageIcon className="h-3 w-3" />
                  View image from sighting
                </a>
              </div>
            )}

            <div className="text-xs text-muted-foreground mt-2">
              Reported {formatDateTime(sighting.createdAt)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
