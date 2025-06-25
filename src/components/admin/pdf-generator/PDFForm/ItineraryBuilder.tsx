// src/components/admin/pdf-generator/PDFForm/ItineraryBuilder.tsx
'use client';

import { UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { PDFFormData, ItineraryDay } from '../../../../types/pdf-generator.types';
import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Calendar, Clock } from 'lucide-react';

interface ItineraryBuilderProps {
  watch: UseFormWatch<PDFFormData>;
  setValue: UseFormSetValue<PDFFormData>;
  errors: FieldErrors<PDFFormData>;
}

export default function ItineraryBuilder({ watch, setValue, errors }: ItineraryBuilderProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0])); // First day expanded by default
  const itinerary = watch('itinerary') || [];

  const addDay = () => {
    const newDay: ItineraryDay = {
      dayNumber: itinerary.length + 1,
      dayTitle: `Day ${itinerary.length + 1}`,
      dayDescription: ''
    };
    setValue('itinerary', [...itinerary, newDay]);
    // Expand the newly added day
    setExpandedDays(prev => {
      const newSet = new Set(Array.from(prev));
      newSet.add(itinerary.length);
      return newSet;
    });
  };

  const removeDay = (index: number) => {
    if (itinerary.length > 1) {
      const updatedItinerary = itinerary
        .filter((_, i) => i !== index)
        .map((day, i) => ({ ...day, dayNumber: i + 1 }));
      setValue('itinerary', updatedItinerary);
      
      // Update expanded days
      setExpandedDays(prev => {
        const prevArray = Array.from(prev);
        const filteredArray = prevArray.filter(dayIndex => dayIndex !== index);
        // Adjust indices for remaining days
        const adjustedArray = filteredArray.map(dayIndex => 
          dayIndex > index ? dayIndex - 1 : dayIndex
        );
        return new Set(adjustedArray);
      });
    }
  };

  const updateDay = (index: number, field: keyof ItineraryDay, value: string | number) => {
    const updatedItinerary = itinerary.map((day, i) => 
      i === index ? { ...day, [field]: value } : day
    );
    setValue('itinerary', updatedItinerary);
  };

  const toggleDayExpansion = (index: number) => {
    setExpandedDays(prev => {
      const newSet = new Set(Array.from(prev));
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const generateBasicItinerary = (days: number) => {
    const basicItinerary: ItineraryDay[] = [];
    for (let i = 1; i <= days; i++) {
      basicItinerary.push({
        dayNumber: i,
        dayTitle: i === 1 ? 'Arrival' : i === days ? 'Departure' : `Day ${i}`,
        dayDescription: i === 1 
          ? 'Arrival at destination, check-in to hotel, welcome briefing'
          : i === days 
          ? 'Check-out, departure transfers'
          : `Activities and sightseeing for day ${i}`
      });
    }
    setValue('itinerary', basicItinerary);
    setExpandedDays(new Set([0])); // Expand first day
  };

  // Initialize with at least one day if empty
  if (itinerary.length === 0) {
    const initialDay: ItineraryDay = {
      dayNumber: 1,
      dayTitle: 'Day 1',
      dayDescription: ''
    };
    setValue('itinerary', [initialDay]);
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Itinerary Builder</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{itinerary.length} days</span>
        </div>
      </div>

      {/* Quick Setup */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Quick Setup</h4>
        <div className="flex flex-wrap gap-2">
          {[3, 5, 7, 10, 14].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => generateBasicItinerary(days)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              {days} Days
            </button>
          ))}
        </div>
        <p className="text-xs text-blue-600 mt-2">
          Generate a basic itinerary template with arrival and departure days
        </p>
      </div>

      {/* Itinerary Days */}
      <div className="space-y-3">
        {itinerary.map((day, index) => {
          const isExpanded = expandedDays.has(index);
          return (
            <div key={index} className="border border-gray-200 rounded-lg">
              {/* Day Header */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleDayExpansion(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {day.dayNumber}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{day.dayTitle || `Day ${day.dayNumber}`}</h4>
                    {day.dayDescription && (
                      <p className="text-sm text-gray-500 truncate max-w-md">
                        {day.dayDescription.substring(0, 60)}
                        {day.dayDescription.length > 60 ? '...' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {itinerary.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDay(index);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Day Details */}
              {isExpanded && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="space-y-4">
                    {/* Day Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Day Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={day.dayTitle}
                        onChange={(e) => updateDay(index, 'dayTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Day ${day.dayNumber} title`}
                      />
                    </div>

                    {/* Day Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Day Description
                      </label>
                      <textarea
                        rows={4}
                        value={day.dayDescription || ''}
                        onChange={(e) => updateDay(index, 'dayDescription', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe the activities, sightseeing, meals, and experiences for this day..."
                      />
                    </div>

                    {/* Quick Templates for Day Description */}
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Quick Templates</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => updateDay(index, 'dayDescription', 'Morning arrival, hotel check-in, welcome briefing, rest and relaxation')}
                          className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-left"
                        >
                          Arrival Day
                        </button>
                        <button
                          type="button"
                          onClick={() => updateDay(index, 'dayDescription', 'Full day city tour, visit major attractions, lunch at local restaurant, evening free time')}
                          className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-left"
                        >
                          Sightseeing Day
                        </button>
                        <button
                          type="button"
                          onClick={() => updateDay(index, 'dayDescription', 'Hotel check-out, departure transfers, end of tour')}
                          className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-left"
                        >
                          Departure Day
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Day Button */}
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={addDay}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Day
        </button>
      </div>

      {/* Error Message */}
      {errors.itinerary && (
        <p className="mt-2 text-sm text-red-600">{errors.itinerary.message}</p>
      )}

      {/* Summary */}
      {itinerary.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <h5 className="text-sm font-medium text-gray-700">Itinerary Summary</h5>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Days: </span>
              <span className="font-medium">{itinerary.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Completed: </span>
              <span className="font-medium">
                {itinerary.filter(day => day.dayTitle && day.dayDescription).length}/{itinerary.length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Status: </span>
              <span className={`font-medium ${
                itinerary.every(day => day.dayTitle && day.dayDescription) 
                  ? 'text-green-600' 
                  : 'text-yellow-600'
              }`}>
                {itinerary.every(day => day.dayTitle && day.dayDescription) ? 'Complete' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}