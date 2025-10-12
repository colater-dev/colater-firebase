'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { Brand } from '@/lib/types';

interface BrandHeaderProps {
  brand: Brand;
}

export function BrandHeader({ brand }: BrandHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-bold">{brand.latestName}</CardTitle>
        <CardDescription>{brand.latestElevatorPitch}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">
          <strong>Target Audience:</strong> {brand.latestAudience}
        </p>
        {brand.latestDesirableCues && (
          <p className="text-sm">
            <strong>Desirable Cues:</strong> {brand.latestDesirableCues}
          </p>
        )}
        {brand.latestUndesirableCues && (
          <p className="text-sm">
            <strong>Undesirable Cues:</strong> {brand.latestUndesirableCues}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
