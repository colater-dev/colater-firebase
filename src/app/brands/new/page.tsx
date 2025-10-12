'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, serverTimestamp, addDoc } from 'firebase/firestore';
import { useUser, useFirestore, FirestorePermissionError, errorEmitter } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 characters.'),
  elevatorPitch: z.string().min(10, 'Elevator pitch must be at least 10 characters.'),
  audience: z.string().min(10, 'Target audience must be at least 10 characters.'),
  desirableCues: z.string().optional(),
  undesirableCues: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewBrandPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      elevatorPitch: '',
      audience: '',
      desirableCues: '',
      undesirableCues: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a brand.',
      });
      return;
    }

    setIsSubmitting(true);
    
    const brandData = {
      userId: user.uid,
      createdAt: serverTimestamp(),
      latestName: values.name,
      latestElevatorPitch: values.elevatorPitch,
      latestAudience: values.audience,
      latestDesirableCues: values.desirableCues || '',
      latestUndesirableCues: values.undesirableCues || '',
    };
    
    const brandsCollection = collection(firestore, `users/${user.uid}/brands`);
    
    addDoc(brandsCollection, brandData)
      .then((brandDocRef) => {
        if (!brandDocRef) {
          throw new Error('Failed to create brand document.');
        }

        toast({
          title: 'Brand Created!',
          description: 'Redirecting to generate taglines...',
        });

        router.push(`/brands/${brandDocRef.id}/taglines`);
      })
      .catch((error) => {
        setIsSubmitting(false);

        // Check if it's a permission error, otherwise show generic toast
        if (error.code === 'permission-denied') {
             // Construct and emit the specialized error for debugging
             const permissionError = new FirestorePermissionError({
                path: brandsCollection.path,
                operation: 'create',
                requestResourceData: brandData,
             });
             errorEmitter.emit('permission-error', permissionError);
        } else {
            console.error('Error creating brand:', error);
            toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: (error instanceof Error) ? error.message : 'Could not save the brand.',
            });
        }
      });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
            <div className="flex items-center gap-4 mb-4">
               <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft />
                    </Link>
                </Button>
                <div>
                    <CardTitle className="text-2xl font-bold">Create a New Brand</CardTitle>
                    <CardDescription>Fill out the details below to get started.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'Acmecorp'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="elevatorPitch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Elevator Pitch</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your brand in a few sentences."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="audience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Tech-savvy millennials who value design...'"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="desirableCues"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desirable visual cues</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'minimalist, elegant, bird, blue'"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="undesirableCues"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Undesirable visual cues</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'complex, childish, gradients, red'"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Brand & Generate Assets'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
