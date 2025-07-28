"use client";

import React, { useState, useMemo } from 'react';
import { EnrichedProjectData } from '@/services/projectData.service';
import { formatAmount, formatNumber } from '@/helpers/donations';
import Image from 'next/image';
import Link from 'next/link';

interface ProjectsDataTableProps {
  projects: EnrichedProjectData[];
  isLoading?: boolean;
}

type SortField = 'title' | 'seasonNumber' | 'totalDonatedUSD' | 'supporterCount' | 'marketCapUSD' | 'priceUSD';
type SortDirection = 'asc' | 'desc';

const ProjectsDataTable: React.FC<ProjectsDataTableProps> = ({ projects, isLoading = false }) => {
  const [sortField, setSortField] = useState<SortField>('totalDonatedUSD');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');

  // Get unique seasons for filter
  const seasons = useMemo(() => {
    const uniqueSeasons = Array.from(new Set(projects.map(p => p.seasonNumber))).sort((a, b) => b - a);
    return uniqueSeasons;
  }, [projects]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tokenTicker?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply season filter
    if (selectedSeason !== 'all') {
      filtered = filtered.filter(project => project.seasonNumber === parseInt(selectedSeason));
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [projects, searchTerm, selectedSeason, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="w-full relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-peach-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg font-medium">Loading project data...</p>
            <p className="text-neutral-400 text-sm">Fetching token prices and market data</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search projects or tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:border-peach-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            disabled={isLoading}
            className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-peach-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="all">All Seasons</option>
            {seasons.map(season => (
              <option key={season} value={season.toString()}>
                Season {season}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-neutral-800 rounded-lg overflow-hidden">
          <thead className="bg-neutral-700">
            <tr>
              <th className="px-6 py-4 text-left text-white font-semibold">Project</th>
              <th 
                className={`px-6 py-4 text-left text-white font-semibold cursor-pointer hover:bg-neutral-600 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                onClick={() => !isLoading && handleSort('seasonNumber')}
              >
                Season {getSortIcon('seasonNumber')}
              </th>
              <th 
                className={`px-6 py-4 text-right text-white font-semibold cursor-pointer hover:bg-neutral-600 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                onClick={() => !isLoading && handleSort('totalDonatedUSD')}
              >
                Total Raised {getSortIcon('totalDonatedUSD')}
              </th>
              <th 
                className={`px-6 py-4 text-right text-white font-semibold cursor-pointer hover:bg-neutral-600 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                onClick={() => !isLoading && handleSort('supporterCount')}
              >
                Supporters {getSortIcon('supporterCount')}
              </th>
              <th 
                className={`px-6 py-4 text-right text-white font-semibold cursor-pointer hover:bg-neutral-600 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                onClick={() => !isLoading && handleSort('priceUSD')}
              >
                Token Price {getSortIcon('priceUSD')}
              </th>
              <th 
                className={`px-6 py-4 text-right text-white font-semibold cursor-pointer hover:bg-neutral-600 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                onClick={() => !isLoading && handleSort('marketCapUSD')}
              >
                Market Cap {getSortIcon('marketCapUSD')}
              </th>
              <th className="px-6 py-4 text-right text-white font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProjects.map((project, index) => (
              <ProjectDataRow key={project.id} project={project} index={index} isLoading={isLoading} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      <div className="mt-4 text-neutral-400 text-sm">
        Showing {filteredAndSortedProjects.length} of {projects.length} projects
      </div>
    </div>
  );
};

interface ProjectDataRowProps {
  project: EnrichedProjectData;
  index: number;
  isLoading?: boolean;
}

const ProjectDataRow: React.FC<ProjectDataRowProps> = ({ project, index, isLoading = false }) => {
  // Helper function to safely format currency values
  const formatCurrency = (value: number | null | undefined, decimals: number = 2) => {
    if (value === null || value === undefined || isNaN(value) || value === 0) {
      return '---';
    }
    return formatAmount(value, decimals);
  };

  // Helper function to safely format numbers
  const formatCount = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }
    return formatNumber(value);
  };
  return (
    <tr className={`border-t border-neutral-700 hover:bg-neutral-750 ${index % 2 === 0 ? 'bg-neutral-800' : 'bg-neutral-825'}`}>
      {/* Project info */}
      <td className="px-6 py-4">
        <Link href={`/project/${project.slug}`} className="flex items-center space-x-3 group">
          <div className="w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={project.icon || project.image || '/images/user.png'}
              alt={`${project.title} icon`}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white font-semibold group-hover:text-peach-400 truncate">
              {project.title}
            </div>
            <div className="text-neutral-400 text-sm truncate">
              {project.tokenTicker && `$${project.tokenTicker}`}
            </div>
                         {project.categories && project.categories.length > 0 && (
               <div className="flex flex-wrap gap-1 mt-1">
                 {project.categories.slice(0, 2).map((category: { name: string }, idx: number) => (
                   <span
                     key={idx}
                     className="text-xs px-2 py-1 bg-neutral-700 text-neutral-300 rounded-full"
                   >
                     {category.name}
                   </span>
                 ))}
                 {project.categories.length > 2 && (
                   <span className="text-xs text-neutral-400">
                     +{project.categories.length - 2} more
                   </span>
                 )}
               </div>
             )}
          </div>
        </Link>
      </td>

      {/* Season */}
      <td className="px-6 py-4 text-white">
        Season {project.seasonNumber}
      </td>

      {/* Total Raised */}
      <td className="px-6 py-4 text-right">
        {isLoading ? (
          <div className="flex flex-col items-end">
            <div className="w-16 h-4 bg-neutral-700 rounded animate-pulse mb-1"></div>
            <div className="w-12 h-3 bg-neutral-700 rounded animate-pulse"></div>
          </div>
        ) : (
          <>
            <div className="text-white font-semibold">
              ${formatCurrency(project.totalDonatedUSD)}
            </div>
            <div className="text-neutral-400 text-sm">
              {formatCount(project.totalDonatedPOL)} POL
            </div>
          </>
        )}
      </td>

      {/* Supporters */}
      <td className="px-6 py-4 text-right text-white">
        {isLoading ? (
          <div className="w-12 h-4 bg-neutral-700 rounded animate-pulse ml-auto"></div>
        ) : (
          formatCount(project.supporterCount)
        )}
      </td>

      {/* Token Price */}
      <td className="px-6 py-4 text-right">
        {isLoading ? (
          <div className="flex flex-col items-end">
            <div className="w-16 h-4 bg-neutral-700 rounded animate-pulse mb-1"></div>
            <div className="w-12 h-3 bg-neutral-700 rounded animate-pulse"></div>
          </div>
        ) : project.isTokenListed ? (
          <>
            <div className="text-white font-semibold">
              ${formatCurrency(project.priceUSD, 4)}
            </div>
            <div className="text-neutral-400 text-sm">
              {formatCurrency(project.pricePOL, 4)} POL
            </div>
          </>
        ) : (
          <div className="text-neutral-400 text-sm">
            Listing Soon
          </div>
        )}
      </td>

      {/* Market Cap */}
      <td className="px-6 py-4 text-right">
        {isLoading ? (
          <div className="w-16 h-4 bg-neutral-700 rounded animate-pulse ml-auto"></div>
        ) : project.marketCapUSD > 0 ? (
          <div className="text-white font-semibold">
            ${formatCurrency(project.marketCapUSD)}
          </div>
        ) : (
          <div className="text-neutral-400 text-sm">
            N/A
          </div>
        )}
      </td>

      {/* Status */}
      <td className="px-6 py-4 text-right">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          project.isTokenListed 
            ? 'bg-green-900 text-green-200' 
            : 'bg-yellow-900 text-yellow-200'
        }`}>
          {project.isTokenListed ? 'Listed' : 'Unlisted'}
        </span>
      </td>
    </tr>
  );
};

export default ProjectsDataTable; 