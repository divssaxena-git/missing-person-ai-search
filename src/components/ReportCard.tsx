"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, User } from 'lucide-react';

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

interface ReportCardProps {
  report: Report;
  onClick?: () => void;
}

export default function ReportCard({ report, onClick }: ReportCardProps) {
  const statusColors = {
    active: 'bg-red-100 text-red-800 border-red-200',
    found: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
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

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {report.imageUrl ? (
              <img
                src={report.imageUrl}
                alt={report.fullName}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{report.fullName}</h3>
              <p className="text-sm text-muted-foreground">
                {report.age && `${report.age} years old`}
                {report.age && report.gender && ' • '}
                {report.gender && report.gender.charAt(0).toUpperCase() + report.gender.slice(1)}
              </p>
            </div>
          </div>
          <Badge className={statusColors[report.status as keyof typeof statusColors] || statusColors.active}>
            {report.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-muted-foreground">{report.lastSeenLocation}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Last seen: {formatDate(report.lastSeenDate)}</span>
        </div>
        {report.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {report.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
