'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Volume2, Sun, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function SensoryProfileModal({ isOpen, onClose, currentProfile, onSave }) {
  const [noiseSensitivity, setNoiseSensitivity] = useState([5]);
  const [lightSensitivity, setLightSensitivity] = useState([5]);
  const [crowdTolerance, setCrowdTolerance] = useState([5]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      setNoiseSensitivity([currentProfile.noiseSensitivity]);
      setLightSensitivity([currentProfile.lightSensitivity]);
      setCrowdTolerance([currentProfile.crowdTolerance]);
    }
  }, [currentProfile]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave({
        noiseSensitivity: noiseSensitivity[0],
        lightSensitivity: lightSensitivity[0],
        crowdTolerance: crowdTolerance[0]
      });
      
      toast.success('Sensory profile saved!');
      onClose();
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Your Sensory Profile</DialogTitle>
          <DialogDescription>
            Set your sensitivity levels to get personalized route recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Noise Sensitivity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base">
                <Volume2 className="w-5 h-5 text-orange-500" />
                Noise Sensitivity
              </Label>
              <span className="text-3xl font-bold text-orange-500">{noiseSensitivity[0]}</span>
            </div>
            <Slider
              value={noiseSensitivity}
              onValueChange={setNoiseSensitivity}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Not Sensitive</span>
              <span>Very Sensitive</span>
            </div>
            <p className="text-sm text-muted-foreground">
              How sensitive are you to loud noises like traffic, crowds, or music?
            </p>
          </div>

          {/* Light Sensitivity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base">
                <Sun className="w-5 h-5 text-yellow-500" />
                Light Sensitivity
              </Label>
              <span className="text-3xl font-bold text-yellow-500">{lightSensitivity[0]}</span>
            </div>
            <Slider
              value={lightSensitivity}
              onValueChange={setLightSensitivity}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Not Sensitive</span>
              <span>Very Sensitive</span>
            </div>
            <p className="text-sm text-muted-foreground">
              How sensitive are you to bright lights or sunlight?
            </p>
          </div>

          {/* Crowd Tolerance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base">
                <Users className="w-5 h-5 text-blue-500" />
                Crowd Tolerance
              </Label>
              <span className="text-3xl font-bold text-blue-500">{crowdTolerance[0]}</span>
            </div>
            <Slider
              value={crowdTolerance}
              onValueChange={setCrowdTolerance}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Low Tolerance</span>
              <span>High Tolerance</span>
            </div>
            <p className="text-sm text-muted-foreground">
              How comfortable are you in crowded spaces?
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
