
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { useRequireAuth } from '@/features/auth/hooks';
import { createBrandService } from '@/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Loader2, Plus } from 'lucide-react';
import { ContentCard } from '@/components/layout';
import { CreateProjectCard } from '@/components/dashboard/create-project-card';
import type { Brand } from '@/lib/types';

const BrandListItem = ({ brand }: { brand: Brand }) => (
    <Link href={`/brands/${brand.id}`} className="block hover:bg-muted/50 rounded-lg transition-colors group">
        <Card className="h-full flex flex-col">
            <CardContent className="flex-grow flex flex-col p-6 gap-4">
                <div className="flex items-center">
                    <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
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
                            <div className="w-full h-full bg-muted rounded-md" />
                        )}
                    </div>
                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors ml-4">{brand.latestName}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{brand.latestElevatorPitch}</p>
            </CardContent>
        </Card>
    </Link>
);


export default function Dashboard() {
    const { user, isLoading } = useRequireAuth();
    const firestore = useFirestore();
    const brandService = useMemo(() => createBrandService(firestore), [firestore]);

    const brandsQuery = useMemoFirebase(
        () => user ? brandService.getBrandsQuery(user.uid) : null,
        [user, brandService]
    );

    const { data: brands, isLoading: isLoadingBrands } = useCollection<Brand>(brandsQuery);

    if (isLoading || !user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <ContentCard>
            <div className="mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Brands</h1>
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
                    <CreateProjectCard />
                    {brands.map((brand) => (
                        <Link
                            key={brand.id}
                            href={`/brands/${brand.id}`}
                            className="block p-6 bg-white rounded-lg border hover:shadow-md transition-shadow"
                        >
                            <h2 className="text-xl font-semibold mb-2">{brand.latestName}</h2>
                            {brand.latestElevatorPitch && (
                                <p className="text-gray-600 line-clamp-2">{brand.latestElevatorPitch}</p>
                            )}
                        </Link>
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
        </ContentCard>
    );
}
