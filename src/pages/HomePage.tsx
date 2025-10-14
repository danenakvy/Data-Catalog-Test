import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatasetCard } from '@/components/DatasetCard';
import { DatasetCardSkeleton } from '@/components/DatasetCardSkeleton';
import { useDatasets } from '@/hooks/use-datasets';
import { Dataset } from '@shared/types';
export function HomePage() {
  const [searchParams] = useSearchParams();
  const { data: datasets, isLoading, isError, error } = useDatasets();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState('all');
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);
  const allCategories = useMemo(() => {
    if (!datasets) return ['all'];
    const categories = new Set<string>();
    datasets.forEach(dataset => {
      dataset.metadata.categories.forEach(cat => categories.add(cat));
    });
    return ['all', ...Array.from(categories)];
  }, [datasets]);
  const filteredDatasets = useMemo(() => {
    if (!datasets) return [];
    return datasets.filter((dataset: Dataset) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = dataset.title.toLowerCase().includes(lowerSearchTerm) ||
                            dataset.description.toLowerCase().includes(lowerSearchTerm) ||
                            dataset.metadata.keywords.some(kw => kw.toLowerCase().includes(lowerSearchTerm));
      const matchesCategory = categoryFilter === 'all' || dataset.metadata.categories.includes(categoryFilter);
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, categoryFilter, datasets]);
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <DatasetCardSkeleton key={index} />
          ))}
        </div>
      );
    }
    if (isError) {
      return (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-destructive">Failed to load datasets</h3>
          <p className="text-muted-foreground mt-2">{error?.message || 'An unexpected error occurred.'}</p>
        </div>
      );
    }
    if (filteredDatasets.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDatasets.map((dataset) => (
            <DatasetCard key={dataset.id} dataset={dataset} />
          ))}
        </div>
      );
    }
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold">No Datasets Found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your search or filter criteria.</p>
      </div>
    );
  };
  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Data Catalog</h1>
        <p className="text-lg text-muted-foreground">
          Discover, manage, and govern your organization's data assets.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          placeholder="Search datasets by title, keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={isLoading || isError}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {allCategories.map(category => (
              <SelectItem key={category} value={category} className="capitalize">
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {renderContent()}
    </div>
  );
}