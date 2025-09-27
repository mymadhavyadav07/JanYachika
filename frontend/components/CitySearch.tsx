'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { apiBaseUrl } from '@/data/data';

interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface CitySearchProps {
  onCitySelect: (city: City) => void;
  className?: string;
}

const CitySearch: React.FC<CitySearchProps> = ({ onCitySelect, className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load all cities data from different states
  useEffect(() => {
    const loadAllCities = async () => {
      setIsLoading(true);
      try {
        // List of major state codes to load cities from
        const stateCodes = ['DL', 'MH', 'KA', 'TN', 'UP', 'WB', 'GJ', 'RJ', 'MP', 'AP', 'TG', 'KL', 'OR', 'JH', 'AS', 'PB', 'HR', 'UK', 'HP', 'BR'];
        
        const allCities: City[] = [];
        
        // Load cities from multiple states
        for (const stateCode of stateCodes.slice(0, 5)) { // Limit to first 5 states for performance
          try {
            const response = await fetch(`${apiBaseUrl}/get_cities?state_code=${stateCode}`, {
              credentials: 'include'
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.cities && Array.isArray(data.cities)) {
                allCities.push(...data.cities);
              }
            }
          } catch (error) {
            console.warn(`Failed to load cities for state ${stateCode}:`, error);
          }
        }
        
        // Remove duplicates based on city name and sort
        const uniqueCities = allCities.filter((city, index, self) => 
          index === self.findIndex(c => c.name.toLowerCase() === city.name.toLowerCase())
        ).sort((a, b) => a.name.localeCompare(b.name));
        
        setCities(uniqueCities);
      } catch (error) {
        console.error('Failed to load cities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllCities();
  }, []);

  // Filter cities based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCities([]);
      return;
    }

    const filtered = cities.filter(city =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10); // Limit to 10 results for performance

    setFilteredCities(filtered);
    setSelectedIndex(-1);
  }, [searchTerm, cities]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredCities.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCities.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCities.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleCitySelect(filteredCities[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleCitySelect = (city: City) => {
    setSearchTerm(city.name);
    setIsOpen(false);
    onCitySelect(city);
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for cities..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg 
                     bg-white dark:bg-gray-800 dark:border-gray-600 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                     text-sm placeholder-gray-500 dark:placeholder-gray-400
                     dark:text-white"
            disabled={isLoading}
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="h-3 w-3 text-gray-400" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-[9998] w-full mt-1 bg-white dark:bg-gray-800 
                        border border-gray-300 dark:border-gray-600 
                        rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isLoading && (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                Loading cities...
              </div>
            )}
            
            {!isLoading && filteredCities.length === 0 && searchTerm && (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                No cities found
              </div>
            )}
            
            {!isLoading && filteredCities.map((city, index) => (
              <button
                key={`${city.id}-${city.name}`}
                onClick={() => handleCitySelect(city)}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-100 
                          dark:hover:bg-gray-700 flex items-center gap-2 transition-colors
                          ${selectedIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-900 dark:text-white">{city.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitySearch;