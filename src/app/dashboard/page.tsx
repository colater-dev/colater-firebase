
'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  collection,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Plus, ArrowRight } from 'lucide-react';
import UserChip from '@/components/user-chip';
import type { Brand } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const BrandListItem = ({ brand }: { brand: Brand }) => (
    <Link href={`/brands/${brand.id}`} className="block hover:bg-muted/50 rounded-lg transition-colors group">
        <Card className="h-full flex flex-col">
            <CardContent className="flex-grow flex flex-col p-6 gap-4">
                 <div className="flex items-center">
                    <div className="w-16 h-16 flex-shrink-0 bg-muted rounded-md flex items-center justify-center">
                        {brand.logoUrl ? (
                            <Image
                                src={brand.logoUrl}
                                alt={`${brand.latestName} logo`}
                                width={64}
                                height={64}
                                className="object-contain rounded-md"
                                unoptimized={brand.logoUrl.startsWith('data:')}
                            />
                        ) : (
                            <div className="w-full h-full bg-muted/50 rounded-md" />
                        )}
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors ml-4">{brand.latestName}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{brand.latestElevatorPitch}</p>
            </CardContent>
        </Card>
    </Link>
);


export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const brandsQuery = useMemoFirebase(
    () => user ? query(
        collection(firestore, `users/${user.uid}/brands`),
        orderBy('createdAt', 'desc')
    ) : null,
    [user, firestore]
  );
  
  const { data: brands, isLoading: isLoadingBrands } = useCollection<Brand>(brandsQuery);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground">
        <header className="p-4 flex justify-between items-center border-b">
            <h1 className="text-2xl font-bold">My Brands</h1>
            <UserChip />
        </header>

        <main className="p-4 md:p-8">
            <div className="mb-8 flex justify-end">
                <Button asChild>
                    <Link href="/brands/new">
                        <Plus className="mr-2" />
                        Create New Brand
                    </Link>
                </Button>
            </div>

            {isLoadingBrands && (
                 <div className="text-center">
                    <Loader2 className="mx-auto w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground mt-2">Loading your brands...</p>
                </div>
            )}
            
            {!isLoadingBrands && brands && brands.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {brands.map(brand => (
                        <BrandListItem key={brand.id} brand={brand} />
                    ))}
                 </div>
            )}

            {!isLoadingBrands && (!brands || brands.length === 0) && (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">No Brands Yet</h2>
                    <p className="text-muted-foreground mt-2 mb-4">Start by creating your first brand identity.</p>
                    <Button asChild>
                        <Link href="/brands/new">
                            <Plus className="mr-2" />
                            Create New Brand
                        </Link>
                    </Button>
                </div>
            )}
        </main>
    </div>
  );
}
