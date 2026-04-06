import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { MultiSelect } from './ui/MultiSelect';

interface MentorSearchFiltersProps {
  selectedExpertise: string[];
  onExpertiseChange: (expertise: string[]) => void;
  availableOnly: boolean;
  onAvailableOnlyChange: (availableOnly: boolean) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

const EXPERTISE_OPTIONS = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'UI/UX Design',
  'Product Management',
  'Software Architecture',
  'Database Design',
  'Cloud Computing',
  'Cybersecurity',
  'Blockchain',
  'Game Development',
  'Quality Assurance',
  'Technical Writing',
];

export const MentorSearchFilters: React.FC<MentorSearchFiltersProps> = ({
  selectedExpertise,
  onExpertiseChange,
  availableOnly,
  onAvailableOnlyChange,
  onClearFilters,
  isLoading = false,
}) => {
  const hasActiveFilters = selectedExpertise.length > 0 || availableOnly;

  return (
    <Card className="p-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              disabled={isLoading}
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Expertise Areas
          </label>
          <MultiSelect
            options={EXPERTISE_OPTIONS.map(option => ({
              value: option,
              label: option,
            }))}
            value={selectedExpertise}
            onChange={onExpertiseChange}
            placeholder="Select expertise areas..."
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => onAvailableOnlyChange(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 shadow-sm focus:border-brand-300 focus:ring focus:ring-brand-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm font-medium text-slate-700">
              Show only available mentors
            </span>
          </label>
        </div>

        {hasActiveFilters && (
          <div className="border-t border-slate-200 pt-2">
            <div className="text-sm font-medium text-slate-600">
              Active filters:
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {selectedExpertise.map((expertise) => (
                <span
                  key={expertise}
                  className="inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700"
                >
                  {expertise}
                  <button
                    onClick={() => onExpertiseChange(selectedExpertise.filter(e => e !== expertise))}
                    disabled={isLoading}
                    className="ml-1 text-brand-600 hover:text-brand-800"
                  >
                    ×
                  </button>
                </span>
              ))}
              {availableOnly && (
                <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  Available only
                  <button
                    onClick={() => onAvailableOnlyChange(false)}
                    disabled={isLoading}
                    className="ml-1 text-emerald-600 hover:text-emerald-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};