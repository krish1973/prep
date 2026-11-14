import React, { useState } from 'react';
import { Calendar, X, Plus } from 'lucide-react';
import { EventCategory, PrepEvent } from '../../types';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (event: Omit<PrepEvent, 'id' | 'createdAt'>) => Promise<void>;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({
  isOpen,
  onClose,
  onCreateEvent
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('vacation');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let icon = '✈️';
    if (category === 'exam') icon = '📝';
    if (category === 'doctor') icon = '🏥';
    if (category === 'weekend') icon = '🌲';
    if (category === 'errands') icon = '🛍️';

    await onCreateEvent({
      title: title.trim(),
      category,
      destination: destination.trim() || undefined,
      startDate,
      endDate: endDate || undefined,
      notes: notes.trim() || undefined,
      readinessStatus: 'packing',
      icon
    });

    onClose();
    setTitle('');
    setDestination('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-pop-in">
      <div className="w-full max-w-sm bg-warm-50 rounded-3xl border border-warm-200 overflow-hidden shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-warm-900">Create New Event</h3>
          <button onClick={onClose} className="text-warm-400 hover:text-warm-900">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-warm-700 block mb-1">Event Title</label>
            <input
              type="text"
              placeholder="e.g. Goa Family Vacation, Science Project"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-warm-200 rounded-xl px-3 py-2 text-xs text-warm-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-warm-700 block mb-1">Type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full bg-white border border-warm-200 rounded-xl px-2 py-2 text-xs text-warm-900"
              >
                <option value="vacation">Vacation / Travel</option>
                <option value="exam">School Exam</option>
                <option value="doctor">Doctor / Clinic</option>
                <option value="homecoming">Homecoming</option>
                <option value="weekend">Weekend Trip</option>
                <option value="errands">Errands / Shopping</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-warm-700 block mb-1">Destination / Venue</label>
              <input
                type="text"
                placeholder="e.g. City or School"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-white border border-warm-200 rounded-xl px-2.5 py-2 text-xs text-warm-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-warm-700 block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-warm-200 rounded-xl px-2 py-2 text-xs text-warm-900"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-warm-700 block mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-warm-200 rounded-xl px-2 py-2 text-xs text-warm-900"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-warm-700 block mb-1">Notes / Instructions</label>
            <textarea
              placeholder="e.g. Carry warm clothes, reserve spare luggage weight..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-white border border-warm-200 rounded-xl px-3 py-2 text-xs text-warm-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
};
