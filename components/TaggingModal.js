'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Volume2, Sun, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function TaggingModal({ isOpen, onClose, location, onSubmit }) {
  const [noiseLevel, setNoiseLevel] = useState([5]);
  const [lightingLevel, setLightingLevel] = useState([5]);
  const [crowdDensity, setCrowdDensity] = useState([5]);
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const [environment, setEnvironment] = useState('Outdoor');
  const [placeName, setPlaceName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({
        latitude: location.lat,
        longitude: location.lng,
        noiseLevel: noiseLevel[0],
        lightingLevel: lightingLevel[0],
        crowdDensity: crowdDensity[0],
        timeOfDay,
        environment,
        placeName,
        notes
      });
      
      toast.success('Location tagged successfully!');
      onClose();
      
      // Reset form
      setNoiseLevel([5]);
      setLightingLevel([5]);
      setCrowdDensity([5]);
      setTimeOfDay('Morning');
      setEnvironment('Outdoor');
      setPlaceName('');
      setNotes('');
    } catch (error) {
      toast.error('Failed to tag location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tag This Location</DialogTitle>
          <DialogDescription>
            Help the community by sharing sensory information about this location
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Place Name */}
          <div className="space-y-2">
            <Label htmlFor="placeName">Place Name (Optional)</Label>
            <Input
              id="placeName"
              placeholder="e.g., Central Park, Coffee Shop"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
            />
          </div>

          {/* Noise Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Noise Level
              </Label>
              <span className="text-2xl font-bold">{noiseLevel[0]}</span>
            </div>
            <Slider
              value={noiseLevel}
              onValueChange={setNoiseLevel}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Silent</span>
              <span>Very Loud</span>
            </div>
          </div>

          {/* Lighting Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Sun className="w-4 h-4" />
                Lighting Intensity
              </Label>
              <span className="text-2xl font-bold">{lightingLevel[0]}</span>
            </div>
            <Slider
              value={lightingLevel}
              onValueChange={setLightingLevel}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Dark</span>
              <span>Very Bright</span>
            </div>
          </div>

          {/* Crowd Density */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Crowd Density
              </Label>
              <span className="text-2xl font-bold">{crowdDensity[0]}</span>
            </div>
            <Slider
              value={crowdDensity}
              onValueChange={setCrowdDensity}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Empty</span>
              <span>Very Crowded</span>
            </div>
          </div>

          {/* Time of Day */}
          <div className="space-y-2">
            <Label>Time of Day</Label>
            <Select value={timeOfDay} onValueChange={setTimeOfDay}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Morning">Morning (5 AM - 12 PM)</SelectItem>
                <SelectItem value="Afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                <SelectItem value="Evening">Evening (5 PM - 9 PM)</SelectItem>
                <SelectItem value="Night">Night (9 PM - 5 AM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Environment */}
          <div className="space-y-2">
            <Label>Environment</Label>
            <Select value={environment} onValueChange={setEnvironment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Indoor">Indoor</SelectItem>
                <SelectItem value="Outdoor">Outdoor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional details about this location..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Tag'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
