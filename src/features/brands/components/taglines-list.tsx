'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, Plus, Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tagline } from '@/lib/types';

interface TaglinesListProps {
  taglines: Tagline[];
  isLoading: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
  onStatusUpdate: (taglineId: string, status: 'liked' | 'disliked') => void;
}

export function TaglinesList({
  taglines,
  isLoading,
  isGenerating,
  onGenerate,
  onStatusUpdate,
}: TaglinesListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" /> AI Generated Taglines
          </CardTitle>
          <CardDescription>More catchy taglines for your brand.</CardDescription>
        </div>
        <Button onClick={onGenerate} disabled={isGenerating} size="sm">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="mr-2" />
              New Tagline
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && taglines.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : taglines.length > 0 ? (
          <ul className="space-y-4">
            {taglines.map((item) => (
              <li
                key={item.id}
                className="group flex items-center justify-between p-4 bg-muted/50 rounded-lg border"
              >
                <span>{item.tagline}</span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onStatusUpdate(item.id, 'liked')}
                  >
                    <Star
                      className={cn(
                        'h-5 w-5',
                        item.status === 'liked'
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-muted-foreground'
                      )}
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onStatusUpdate(item.id, 'disliked')}
                  >
                    <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              No taglines generated yet. Click the button to start.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
