"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, Calendar, Phone, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ReportSightingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: number;
  personName: string;
  onSuccess?: () => void;
}

export default function ReportSightingDialog({
  open,
  onOpenChange,
  reportId,
  personName,
  onSuccess,
}: ReportSightingDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sightingLocation: '',
    sightingDate: '',
    description: '',
    contactInfo: '',
    imageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/sightings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          reportedByUserId: user?.id || null,
          sightingLocation: formData.sightingLocation,
          sightingDate: formData.sightingDate,
          description: formData.description || null,
          contactInfo: formData.contactInfo || null,
          imageUrl: formData.imageUrl || null,
        }),
      });

      if (response.ok) {
        toast.success('Sighting reported successfully! Thank you for your help.');
        setFormData({
          sightingLocation: '',
          sightingDate: '',
          description: '',
          contactInfo: '',
          imageUrl: '',
        });
        onOpenChange(false);
        onSuccess?.();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to report sighting');
      }
    } catch (error) {
      console.error('Failed to report sighting:', error);
      toast.error('An error occurred while reporting the sighting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Sighting</DialogTitle>
          <DialogDescription>
            Have you seen <strong>{personName}</strong>? Please provide details about the sighting.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>
            <AlertDescription className="text-sm">
              Your information helps reunite families. All reports are reviewed for accuracy.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="sightingLocation" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Sighting Location *
            </Label>
            <Input
              id="sightingLocation"
              placeholder="Where did you see them?"
              value={formData.sightingLocation}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sightingLocation: e.target.value }))
              }
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sightingDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date & Time of Sighting *
            </Label>
            <Input
              id="sightingDate"
              type="datetime-local"
              value={formData.sightingDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sightingDate: e.target.value }))
              }
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide additional details about the sighting..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactInfo" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Your Contact Information
            </Label>
            <Input
              id="contactInfo"
              type="text"
              placeholder="Phone or email (optional)"
              value={formData.contactInfo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contactInfo: e.target.value }))
              }
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Optional - Provide contact info if authorities need to reach you
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Image URL
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg (optional)"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
              }
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Optional - Link to a photo from the sighting
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Sighting'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
