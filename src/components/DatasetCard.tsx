import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Lock } from 'lucide-react';
import { Dataset } from '@shared/types';
import { formatDistanceToNow } from 'date-fns';
interface DatasetCardProps {
  dataset: Dataset;
}
export function DatasetCard({ dataset }: DatasetCardProps) {
  return (
    <Link to={`/datasets/${dataset.id}`} className="block group">
      <Card className="h-full flex flex-col transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold group-hover:text-primary">{dataset.title}</CardTitle>
            <Badge variant={dataset.visibility === 'Public' ? 'secondary' : 'outline'} className="flex items-center gap-1.5 whitespace-nowrap">
              {dataset.visibility === 'Public' ? <Eye className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {dataset.visibility}
            </Badge>
          </div>
          <CardDescription className="text-sm text-muted-foreground pt-1">
            Updated {formatDistanceToNow(new Date(dataset.updatedAt), { addSuffix: true })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">{dataset.description}</p>
        </CardContent>
        <CardFooter>
          <div className="flex flex-wrap gap-2">
            {dataset.metadata.categories.slice(0, 3).map((category) => (
              <Badge key={category} variant="outline">{category}</Badge>
            ))}
            {dataset.metadata.categories.length > 3 && (
              <Badge variant="outline">+{dataset.metadata.categories.length - 3} more</Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}