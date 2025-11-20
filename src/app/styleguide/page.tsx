'use client';

import { ShaderLoader } from '@/components/ui/shader-loader';

export default function StyleguidePage() {
    return (
        <div className="min-h-screen pt-[72px] flex flex-col items-center justify-center gap-8 bg-gray-50 p-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">Loader Concept</h1>
                <p className="text-lg text-gray-600">
                    Selected p5.js visualization concept.
                </p>
            </div>

            <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-8 text-center">Shader Evolution</h2>
                <ShaderLoader />
            </div>
        </div>
    );
}
